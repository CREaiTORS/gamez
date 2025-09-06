# GameZ Architecture

## Overview

GameZ is a sophisticated React-based game development toolkit that provides a robust foundation for building interactive games. The architecture follows several key design principles:

### Core Design Principles

1. **Event-Driven Architecture**: Built on EventEmitter2 for decoupled communication
2. **Immutable State Management**: Leverages React's useSyncExternalStore for efficient state updates
3. **Asset-First Design**: Preloading and blob URL management for optimal performance
4. **Type Safety**: Full TypeScript support with generic constraints
5. **Testing-First**: Comprehensive test coverage with Jest and React Testing Library

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GameZ Toolkit                          │
├─────────────────────────────────────────────────────────────┤
│  Components Layer                                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │ GameServiceWrapper│ │ ResultOverlay   │ │ LivesTracker  │ │
│  │ ErrorBoundary    │ │ CachedImage     │ │ Button        │ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Hooks Layer                                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │ useCountDown    │ │ useStateRef     │ │ useResult     │ │
│  │ useForceUpdate  │ │ useLastCallback │ │               │ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Core Game Management                                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                GameService                              │ │
│  │  ┌───────────────┐ ┌────────────────┐ ┌──────────────┐  │ │
│  │  │ Session Mgmt  │ │ State Mgmt     │ │ Asset Mgmt   │  │ │
│  │  │ - initialized │ │ - immutable    │ │ - preloading │  │ │
│  │  │ - active      │ │ - reactive     │ │ - blob URLs  │  │ │
│  │  │ - paused      │ │ - event-driven │ │ - warnings   │  │ │
│  │  │ - end         │ │                │ │              │  │ │
│  │  └───────────────┘ └────────────────┘ └──────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Utility Libraries                                          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │ Arrays Utils    │ │ Random Numbers  │ │ Time Utils    │ │
│  │ Audio Manager   │ │ Image Cache     │ │ Helpers       │ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### GameService

The heart of the system, managing:

- **Session Lifecycle**: Complex state machine with validation
- **Event Broadcasting**: Type-safe event system with wildcard support
- **Asset Management**: Intelligent preloading with blob URL optimization
- **Report Aggregation**: Functional approach to data collection
- **Level Progression**: Index-based with bounds checking

### GameManager

Multi-game orchestration with:

- **Service Registry**: Type-safe game service management
- **Bulk Operations**: Parallel asset preloading across games
- **Report Aggregation**: Cross-game analytics collection

### React Integration

- **useSyncExternalStore**: Efficient subscriptions without unnecessary re-renders
- **Context API**: Service injection for component trees
- **Error Boundaries**: Graceful error handling with user feedback

## Performance Considerations

### Asset Loading Strategy

1. **Blob URL Caching**: Converts network resources to in-memory blob URLs
2. **Preload Validation**: Warns about non-preloaded assets in development
3. **Parallel Loading**: Promise.allSettled for non-blocking asset resolution
4. **Memory Management**: Automatic cleanup of blob URLs on component unmount

### State Management Optimization

1. **Minimal Re-renders**: useSyncExternalStore only triggers on relevant changes
2. **Immutable Updates**: Spread operator patterns prevent reference pollution
3. **Event Batching**: EventEmitter2 configuration for optimal performance
4. **Lazy Evaluation**: Report collection only occurs on session end

### Memory Management

1. **Automatic Cleanup**: Session reset removes all event listeners
2. **Blob URL Lifecycle**: Proper cleanup prevents memory leaks
3. **Weak References**: Where applicable, avoid circular references

## Security Considerations

### Asset Security

- **CORS Validation**: Fetch operations respect cross-origin policies
- **URL Validation**: Asset URLs are validated before blob creation
- **Content-Type Checking**: Ensures loaded assets match expected types

### State Integrity

- **Immutable Patterns**: Prevents accidental state mutations
- **Validation Barriers**: Session state transitions are validated
- **Type Constraints**: Generic constraints prevent invalid state shapes

## Error Handling Strategy

### Graceful Degradation

1. **Asset Loading Failures**: Continue with placeholder or network URLs
2. **State Corruption**: Automatic session reset with user notification
3. **React Errors**: ErrorBoundary catches and displays user-friendly messages

### Development Aids

1. **Comprehensive Warnings**: Asset access patterns trigger helpful warnings
2. **Debug Logging**: Configurable logging levels for development
3. **Type Safety**: Compile-time error prevention through strict TypeScript

## Testing Architecture

### Unit Testing

- **Pure Function Coverage**: All utilities have comprehensive unit tests
- **Mock Strategies**: Proper isolation of external dependencies
- **Edge Case Validation**: Boundary condition testing for robustness

### Integration Testing

- **Component Testing**: React Testing Library for user-centric tests
- **Service Integration**: GameService lifecycle testing
- **Event Flow Testing**: End-to-end event propagation validation

### Performance Testing

- **Asset Loading**: Timing validation for preload operations
- **Memory Usage**: Leak detection and cleanup validation
- **Render Performance**: React component render timing
