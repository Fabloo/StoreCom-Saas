'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

type GMBAccount = {
  name: string
  accountName: string
}

type GMBLocation = {
  name: string
  locationName: string
}

export default function ReviewsTestPage() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [authMode, setAuthMode] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<GMBAccount[]>([])
  const [locations, setLocations] = useState<GMBLocation[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [reviews, setReviews] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [debugLog, setDebugLog] = useState<
    { endpoint: string; ok: boolean; status?: number; data?: any; error?: any; at: string }[]
  >([])

  const pushDebug = (entry: { endpoint: string; ok: boolean; status?: number; data?: any; error?: any }) => {
    setDebugLog((prev) => [
      {
        ...entry,
        at: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 50))
  }

  const startOAuth = async () => {
    try {
      setLoading(true)
      const returnTo = encodeURIComponent('/google-business/reviews-test')
      const url = `/api/google-business/auth?mode=oauth&returnTo=${returnTo}`
      const res = await fetch(url)
      const data = await res.json()
      pushDebug({ endpoint: url, ok: res.ok, status: res.status, data })
      if (data?.authUrl) {
        window.location.href = data.authUrl
        return
      }
      throw new Error('No authUrl returned')
    } catch (e: any) {
      pushDebug({ endpoint: 'startOAuth', ok: false, error: e?.message || String(e) })
      setError(e?.message || 'Failed to start Google sign-in')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        const returnTo = encodeURIComponent('/google-business/reviews-test')
        const url = `/api/google-business/auth?check=1&returnTo=${returnTo}`
        const res = await fetch(url)
        const data = await res.json()
        console.log("res", res);
        console.log("data auth", data);

        pushDebug({ endpoint: url, ok: res.ok, status: res.status, data })
        setIsAuth(Boolean(data.success))
        setAuthMode(data.mode ?? (data.authUrl ? 'oauth' : null))
      } catch (e: any) {
        pushDebug({ endpoint: '/api/google-business/auth?check=1', ok: false, error: e?.message || String(e) })
        setIsAuth(false)
        setAuthMode(null)
      }
    })()
  }, [])

  const fetchAccounts = async () => {
    setLoading(true)
    setError(null)
    setReviews(null)
    try {
      const returnTo = encodeURIComponent('/google-business/reviews-test')
      const url = `/api/google-business/accounts?returnTo=${returnTo}`
      const res = await fetch(url)
      const data = await res.json()
      pushDebug({ endpoint: url, ok: res.ok, status: res.status, data })
      if (data?.requireAuth && data?.authUrl) {
        // If service account lacks permission, start OAuth
        window.location.href = data.authUrl
        return
      }
      if (!res.ok || !data.success) throw new Error(data.error || data.details || 'Failed to load accounts')
      setAccounts(data.accounts || [])
      if (data.accounts?.length) {
        const first = data.accounts[0]?.name
        setSelectedAccount(first)
        if (first) await fetchLocations(first)
      }
    } catch (e: any) {
      pushDebug({ endpoint: 'fetchAccounts', ok: false, error: e?.message || String(e) })
      setError(e.message || 'Unknown error while fetching accounts')
    } finally {
      setLoading(false)
    }
  }

  const fetchLocations = async (accountName: string) => {
    if (!accountName) return
    setLoading(true)
    setError(null)
    setReviews(null)
    try {
      const url = `/api/google-business/locations?accountName=${encodeURIComponent(accountName)}`
      const res = await fetch(url)
      const data = await res.json()
      pushDebug({ endpoint: url, ok: res.ok, status: res.status, data })
      if (!res.ok || !data.success) throw new Error(data.error || data.details || 'Failed to load locations')
      setLocations(data.locations || [])
      if (data.locations?.length) setSelectedLocation(data.locations[0].name)
    } catch (e: any) {
      pushDebug({ endpoint: 'fetchLocations', ok: false, error: e?.message || String(e) })
      setError(e.message || 'Unknown error while fetching locations')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async (locationName: string) => {
    if (!locationName) return
    setLoading(true)
    setError(null)
    setReviews(null)
    try {
      const url = `/api/google-business/reviews?locationName=${encodeURIComponent(locationName)}`
      const res = await fetch(url)
      const data = await res.json()
      pushDebug({ endpoint: url, ok: res.ok, status: res.status, data })
      if (!res.ok || !data.success) throw new Error(data.error || data.details || 'Failed to load reviews')
      setReviews(data.reviews || [])
    } catch (e: any) {
      pushDebug({ endpoint: 'fetchReviews', ok: false, error: e?.message || String(e) })
      setError(e.message || 'Unknown error while fetching reviews')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>GMB Reviews Test</CardTitle>
          <CardDescription>Verify service account keys and fetch reviews via API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-3">
              <div>
                Auth status:{' '}
                <span className={isAuth === null ? 'text-gray-600' : isAuth ? 'text-green-600' : 'text-red-600'}>
                  {isAuth === null ? 'Checking…' : isAuth ? 'OK' : 'NOT AUTHENTICATED'}
                </span>
              </div>
              {!isAuth && (
                <Button size="sm" onClick={startOAuth} disabled={loading}>
                  Sign in with Google
                </Button>
              )}
            </div>
            <div>Mode: {authMode ?? 'unknown'}</div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3 items-end">
            <Button variant="outline" onClick={fetchAccounts} disabled={loading}>
              Load Accounts
            </Button>

            <div className="min-w-[260px]">
              <Select
                value={selectedAccount}
                onValueChange={(val) => {
                  setSelectedAccount(val)
                  fetchLocations(val)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.name} value={a.name}>
                      {a.accountName || a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[260px]">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.name} value={l.name}>
                      {l.locationName || l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => fetchReviews(selectedLocation)} disabled={!selectedLocation || loading}>
              Fetch Reviews
            </Button>
          </div>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {reviews && (
            <div className="space-y-2">
              <div className="text-sm">Received {reviews.length} reviews</div>
              <pre className="max-h-[420px] overflow-auto rounded-md bg-muted p-3 text-xs">
{JSON.stringify(reviews.slice(0, 10), null, 2)}
              </pre>
              {reviews.length > 10 && (
                <div className="text-xs text-muted-foreground">Showing first 10 items</div>
              )}
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">Debug log (latest first)</div>
            <pre className="max-h-[260px] overflow-auto rounded-md bg-muted p-3 text-xs">
{JSON.stringify(debugLog.slice(0, 8), null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


