import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { hash } from 'bcryptjs'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create default organization
  const org = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Organização Padrão',
      slug: 'default',
    },
  })

  console.log('✅ Created organization:', org.name)

  // Create default permissions
  const permissions = [
    { name: 'Visualizar Transações', slug: 'transaction:read', module: 'transaction' },
    { name: 'Criar Transações', slug: 'transaction:create', module: 'transaction' },
    { name: 'Editar Transações', slug: 'transaction:update', module: 'transaction' },
    { name: 'Excluir Transações', slug: 'transaction:delete', module: 'transaction' },
    { name: 'Visualizar Relatórios', slug: 'report:read', module: 'report' },
    { name: 'Visualizar Configurações', slug: 'settings:read', module: 'settings' },
    { name: 'Editar Configurações', slug: 'settings:update', module: 'settings' },
    { name: 'Gerenciar Usuários', slug: 'user:manage', module: 'user' },
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: {},
      create: perm,
    })
  }

  console.log('✅ Created permissions')

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'admin' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Administrador',
      slug: 'admin',
      description: 'Acesso total ao sistema',
    },
  })

  const viewerRole = await prisma.role.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'viewer' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Visualizador',
      slug: 'viewer',
      description: 'Apenas visualização',
    },
  })

  console.log('✅ Created roles')

  // Assign all permissions to admin role
  const allPermissions = await prisma.permission.findMany()
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    })
  }

  // Assign read permissions to viewer role
  const readPermissions = allPermissions.filter(p => p.slug.includes(':read'))
  for (const perm of readPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: viewerRole.id, permissionId: perm.id } },
      update: {},
      create: {
        roleId: viewerRole.id,
        permissionId: perm.id,
      },
    })
  }

  console.log('✅ Assigned permissions to roles')

  // Create a test user (for development only)
  if (process.env.NODE_ENV === 'development') {
    // Default password: 'admin123' (change in production)
    const defaultPassword = 'admin123'
    const passwordHash = await hash(defaultPassword, 10)

    const testUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        passwordHash, // Update hash in case it changed
      },
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        passwordHash,
      },
    })

    // Associate test user with organization and admin role
    await prisma.organizationUser.upsert({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: testUser.id,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        userId: testUser.id,
        roleId: adminRole.id,
      },
    })

    console.log('✅ Created test user: admin@example.com')
    console.log('   Password: admin123 (change in production)')
  }

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

