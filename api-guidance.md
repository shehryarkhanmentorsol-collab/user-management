# API Implementation Guidance

This document provides a comprehensive guide to the User Management and Social Media backend, explaining the architecture, the role of custom decorators, and how to use the available endpoints.

## 1. Custom Decorators: `@CurrentUser()`

### Why use Custom Decorators?
In NestJS, when using a `Passport` guard (like `JwtAuthGuard`), the authenticated user object is attached to the request: `request.user`. 

Accessing it directly in every controller like this is verbose and repetitive:
```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
getMe(@Req() req: any) {
  const user = req.user;
  return user;
}
```

**Benefits of `@CurrentUser()`:**
1.  **Readability**: It makes the controller method signature much cleaner.
2.  **Type Safety**: You can easily type the decorated parameter as `User`.
3.  **Encapsulation**: If the user object structure changes or is stored elsewhere (e.g., in a different property of the request), you only need to update the decorator, not every controller.

### Implementation Code
**File**: `src/common/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    // Allows accessing specific fields like @CurrentUser('id')
    return data ? user?.[data] : user;
  },
);
```

### How to use it:
```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
getMe(@CurrentUser() user: User) {
  return user;
}
```

---

## 2. API Endpoint Reference

All endpoints are prefixed with `/api/v1`.

### Authentication
-   **POST `/auth/register`**: Create a new account.
-   **POST `/auth/login`**: Authenticate and receive a JWT token.

### Users
-   **GET `/users/me`**: Get protected profile of the logged-in user.
-   **PATCH `/users/me`**: Update profile (fullName, bio, avatarUrl).
-   **GET `/users/:id`**: Get public profile of any user.
-   **POST `/users/:id/follow`**: Follow a user.
-   **DELETE `/users/:id/follow`**: Unfollow a user.
-   **GET `/users/:id/followers`**: Get list of followers.
-   **GET `/users/:id/following`**: Get list of following.

### Posts
-   **POST `/posts`**: Create a new post (Auth required).
-   **GET `/posts`**: List posts with filtering (`keyword`, `username`) and sorting (`newest`, `oldest`, `mostLiked`).
-   **GET `/posts/:id`**: Get a single post.
-   **PATCH `/posts/:id`**: Update own post.
-   **DELETE `/posts/:id`**: Delete own post.

### Comments (Nested under Posts)
-   **POST `/posts/:postId/comments`**: Add a comment.
-   **GET `/posts/:postId/comments`**: List comments for a post.
-   **PATCH `/posts/:postId/comments/:id`**: Update own comment.
-   **DELETE `/posts/:postId/comments/:id`**: Delete own comment.

### Reactions (Nested under Posts)
-   **POST `/posts/:postId/reactions`**: React to a post (like, love, wow, sad, angry).
-   **DELETE `/posts/:postId/reactions`**: Remove reaction.
-   **GET `/posts/:postId/reactions/counts`**: Get counts for each reaction type.
-   **GET `/posts/:postId/reactions/me`**: Get current user's reaction to the post.

---

## 3. Data Model Consistency
Each module follows the **Repository Pattern**:
-   **Entities**: Defined in `src/common/database/.../entities` (singular filenames like `user.entity.ts`).
-   **DTOs**: Handle validation via `class-validator` and `class-transformer`.
-   **Services**: Contain business logic and interact with TypeORM repositories.
-   **Controllers**: Map HTTP routes to service methods.
