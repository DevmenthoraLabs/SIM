import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
        <div className="flex h-screen flex-col items-center justify-center gap-2 px-4">
          <div className="rounded-full bg-destructive/10 p-4 mb-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold">{messages.common.errorTitle}</h1>
          <p className="text-sm text-muted-foreground text-center max-w-md mt-1">
            {messages.common.errorDescription}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
            {messages.common.reload}
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
