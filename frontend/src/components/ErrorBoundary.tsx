import { Component, type ReactNode } from 'react'

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
          <h1 className="text-xl font-semibold">Algo deu errado</h1>
          <p className="max-w-md text-center text-sm text-muted-foreground">
            {this.state.error?.message ?? 'Um erro inesperado ocorreu.'}
          </p>
          <button className="text-sm underline" onClick={() => window.location.reload()}>
            Recarregar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
