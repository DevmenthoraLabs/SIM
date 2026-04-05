import { useNavigate } from 'react-router'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { messages } from '@/lib/messages'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 px-4">
      <div className="rounded-full bg-muted p-4 mb-2">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-5xl font-bold tracking-tight">404</h1>
      <p className="text-sm text-muted-foreground text-center max-w-xs mt-1">
        {messages.common.notFoundDescription}
      </p>
      <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
        {messages.common.backToHome}
      </Button>
    </div>
  )
}
