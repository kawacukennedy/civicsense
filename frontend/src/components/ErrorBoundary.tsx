import { Component, ErrorInfo, ReactNode } from 'react'
import ErrorMessage from './ErrorMessage'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <ErrorMessage
              message="Something went wrong. Please refresh the page and try again."
              onRetry={() => window.location.reload()}
            />
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <summary className="cursor-pointer text-red-800 font-semibold">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary