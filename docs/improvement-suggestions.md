# Sugestões de Aprimoramento

## Frontend

### TanStack Query (alta prioridade)

Substituir o padrão manual `useState` + `useEffect` para busca de dados.

**Antes:**
```typescript
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
useEffect(() => {
  api.get('/api/...').then(({ data }) => setData(data)).finally(() => setLoading(false))
}, [])
```

**Depois:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['organizations'],
  queryFn: () => api.get('/api/suporte/organizations').then(r => r.data)
})
```

Ganhos: cache entre páginas, refetch automático ao focar o browser, estados de loading/error consistentes, invalidação de cache após mutações (`queryClient.invalidateQueries`).

---

### Helper de erros da API

O backend retorna `ProblemDetails` com `{ detail: "..." }` em todos os erros. O frontend não lê isso e mostra strings hardcoded. Criar em `src/lib/apiError.ts`:

```typescript
import axios from 'axios'

export function getApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail ?? fallback
  }
  return fallback
}
```

Usar em todos os `catch {}` dos hooks:
```typescript
} catch (error) {
  setServerError(getApiError(error, 'Erro inesperado. Tente novamente.'))
}
```

---

### shadcn Select component

Substituir os `<select>` nativos com Tailwind pelo componente oficial do shadcn:

```bash
npx shadcn@latest add select
```

Impacto: estético e consistência visual com os demais inputs.

---

### Segurança de tokens (longo prazo)

Tokens em `localStorage` são acessíveis via XSS. Para maior segurança, migrar para HttpOnly cookies — exige mudanças na arquitectura de auth (backend passa a emitir cookies em vez de retornar tokens no body). Aceitável como localStorage para MVP.

---

## Backend

O backend está bem estruturado e segue os padrões recomendados do ASP.NET Core. Sem itens prioritários identificados.

Para referência, o que está correcto e não deve ser alterado:
- `GlobalExceptionHandler` com `IExceptionHandler` + `ProblemDetails` — padrão ASP.NET Core 8+
- `IHttpClientFactory` com named clients
- Global query filters para multi-tenancy
- FluentValidation na camada Application
- Sem Supabase .NET SDK — chamadas HTTP directas são mais controláveis para os endpoints específicos que usamos
