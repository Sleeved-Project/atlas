import { test } from '@japa/runner'
import AuthMiddleware from '#middleware/auth_middleware'
import AuthService from '#services/auth_service'
import AuthException from '#exceptions/auth_exception'
import { AuthUser } from '#types/auth_user_type'
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import sinon from 'sinon'

test.group('AuthMiddleware', (group) => {
  let authMiddleware: AuthMiddleware
  let authService: Partial<AuthService>
  let getmeStub: sinon.SinonStub
  let mockContext: Partial<HttpContext>
  let mockRequest: any
  let mockNext: NextFn

  const mockUser: AuthUser = {
    id: 'user-123',
    email: 'test@example.com',
    fullname: 'Test User',
  }

  const validToken = 'valid-token-123'
  const validAuthHeader = `Bearer ${validToken}`

  group.each.setup(() => {
    // Créer les stubs et mocks
    getmeStub = sinon.stub()
    authService = {
      getMe: getmeStub,
    }

    // Configurer le stub pour retourner un utilisateur par défaut
    getmeStub.withArgs(validToken).resolves(mockUser)

    // Créer une instance du middleware avec le service mocké
    authMiddleware = new AuthMiddleware(authService as AuthService)

    // Créer un mock du context HTTP
    mockRequest = {
      header: sinon.stub(),
    }

    mockContext = {
      request: mockRequest,
    }

    // Mock de la fonction next
    mockNext = sinon.stub().resolves('next-output')
  })

  test('handle - should throw AuthException when authorization header is missing', async ({
    assert,
  }) => {
    // Arrange
    mockRequest.header.withArgs('authorization').returns(null)

    // Act & Assert
    await assert.rejects(
      async () => await authMiddleware.handle(mockContext as HttpContext, mockNext),
      AuthException.message
    )

    sinon.assert.notCalled(getmeStub)
  })

  test('handle - should throw AuthException when token format is invalid', async ({ assert }) => {
    // Arrange
    mockRequest.header.withArgs('authorization').returns('InvalidFormat')

    // Act & Assert
    await assert.rejects(
      async () => await authMiddleware.handle(mockContext as HttpContext, mockNext),
      AuthException.message
    )

    sinon.assert.notCalled(getmeStub)
  })

  test('handle - should throw AuthException when token is empty', async ({ assert }) => {
    // Arrange
    mockRequest.header.withArgs('authorization').returns('Bearer ')

    // Act & Assert
    await assert.rejects(
      async () => await authMiddleware.handle(mockContext as HttpContext, mockNext),
      AuthException.message
    )

    sinon.assert.notCalled(getmeStub)
  })

  test('handle - should call authService.getMe with correct token', async () => {
    // Arrange
    mockRequest.header.withArgs('authorization').returns(validAuthHeader)

    // Act
    await authMiddleware.handle(mockContext as HttpContext, mockNext)

    // Assert
    sinon.assert.calledOnce(getmeStub)
    sinon.assert.calledWith(getmeStub, validToken)
  })

  test('handle - should attach user to context when authentication succeeds', async ({
    assert,
  }) => {
    // Arrange
    mockRequest.header.withArgs('authorization').returns(validAuthHeader)

    // Act
    await authMiddleware.handle(mockContext as HttpContext, mockNext)

    // Assert
    assert.deepEqual(mockContext.authUser, mockUser)
  })

  test('handle - should propagate AuthException from authService', async ({ assert }) => {
    // Arrange
    mockRequest.header.withArgs('authorization').returns(validAuthHeader)
    const authError = new AuthException()
    getmeStub.withArgs(validToken).rejects(authError)

    // Act & Assert
    await assert.rejects(
      async () => await authMiddleware.handle(mockContext as HttpContext, mockNext),
      AuthException.message
    )
  })

  test('handle - should work with different valid tokens', async ({ assert }) => {
    // Arrange
    const customToken = 'different-valid-token'
    const customUser: AuthUser = {
      id: 'user-456',
      email: 'other@example.com',
      fullname: 'Other User',
    }

    mockRequest.header.withArgs('authorization').returns(`Bearer ${customToken}`)
    getmeStub.withArgs(customToken).resolves(customUser)

    // Act
    await authMiddleware.handle(mockContext as HttpContext, mockNext)

    // Assert
    assert.deepEqual(mockContext.authUser, customUser)
    sinon.assert.calledWith(getmeStub, customToken)
  })
})
