import { Component, type ReactNode } from 'react'
import { messages } from '@/lib/messages'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-xl font-semibold">{messages.common.errorTitle}</h1>
          <p className="max-w-md text-center text-sm text-muted-foreground">
            {this.state.error?.message ?? messages.common.unexpected}
          </p>
          <button className="text-sm underline" onClick={() => window.location.reload()}>
            {messages.common.reload}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
