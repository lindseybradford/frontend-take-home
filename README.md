# Frontend Take-Home Assignment

| Resource             | Link                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Design Comp          | [Figma](https://www.figma.com/design/SUJnUkXupIRU7KuVhFq9hJ/WorkOS---Frontend-Take-Home-Assignment---Lindsey-Bradford?node-id=1-40&p=f&t=KGrFl3FZVpKjfKaN-0) |
| Project Instructions | [README](./ProjectInstructions.md)                                                                                                                           |

## Overview

This application is built with [Vite](https://vite.dev/) for fast development with Hot Module Replacement (HMR) and includes:

- **Formatting** with [Prettier](https://prettier.io/)
- **TypeScript** with aliased paths for shared type definitions with the server
- **ESLint** configuration for code quality

The UI is built with [Radix](https://www.radix-ui.com/), which provides excellent keyboard navigation and ARIA support out of the box.

## Getting Started

To run the application:

```bash
cd client && npm run dev
```

## Project Structure

```
src/
├── api/
│   ├── cache.ts              # In-memory caching with TTL
│   └── client.ts             # API client with cache integration
├── components/
│   ├── RolesTab.tsx          # Role management with edit functionality
│   ├── SearchField.tsx       # Reusable search with debouncing
│   ├── DataUI.tsx           # Generic table wrapper component
│   ├── Toast.tsx             # Toast notification provider
│   └── UsersTab.tsx          # User management with delete functionality
├── contexts/
│   ├── AppContext.tsx        # Main application context provider
│   ├── RolesContextDef.ts    # Role context definition
│   ├── ToastContextDef.ts    # Toast context definition
│   ├── types.ts              # TypeScript type definitions
│   └── UsersContextDef.ts    # User context definition
├── hooks/
│   ├── useRoles.ts           # Hook for role context access
│   ├── useToast.ts           # Hook for toast context access
│   └── useUsers.ts           # Hook for user context access
├── util/
│   ├── formatDate.ts         # Date formatting utilities
│   └── sillyLoading.ts       # Fun loading text generator
├── App.tsx                   # Main app with tab navigation
├── index.css                 # Global styles
└── main.tsx                  # Application entry point
```

## Future Improvements (if time were in a bottle…)

### Accessibility Enhancements

- **Focus Management**: Add focus traps to table row actions so tabbing moves directly from a row to its modal instead of continuing down the table
  - Reference: [Radix Primitives Discussion](https://github.com/radix-ui/primitives/issues/2544)

### User Experience

- **Better Error Handling**: Replace toast notifications for role validation errors with inline modal messages for a smoother, less jarring experience
- **Search-Specific Empty States**: Create dedicated empty states for search results instead of falling back to the general "no data" state
- **Loading State Polish**: Eliminate the brief flash of empty table during search transitions
- **Table Polish**: Add sortable columns for better data navigation
- **Visual Consistency**: Establish color coding for role badges and carry those same colors through to the Users table to create visual connections between related data
- **Role Usage Metrics**: Display user counts for each role, either by aggregating data client-side (simpler but less performant) or by extending the server API to include counts (preferred for performance)
- **Roles Pagination**: I wanted to show this is built, but in practice, I would hide it if the response was `pages=null`

### Functionality

- **Undo Actions**: Add "Undo" buttons to delete confirmation toasts for better user control
- **Intentionally Omitted Features** (per README requirements):
  - Create new users and roles
  - Edit user details
  - Delete roles

## Technical Highlights

- **Performance**: In-memory caching reduces redundant API calls
- **Type Safety**: Shared TypeScript definitions between client and server
- **State Management**: Context-based architecture for clean separation of concerns
- **Accessibility**: Built on Radix primitives for robust keyboard and screen reader support

---

✨ Thank you for reading and reviewing!
