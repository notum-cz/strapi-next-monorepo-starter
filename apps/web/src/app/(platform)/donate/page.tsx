'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function DonatePage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'SOL' | 'USDC'>('SOL');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    donationId?: string;
    txHash?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/blockchain/donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          amount: parseFloat(amount),
          currency,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: 'Donation processed successfully!',
          donationId: data.data.donationId,
          txHash: data.data.transactionHash,
        });
        // Reset form
        setWalletAddress('');
        setAmount('');
      } else {
        setResult({
          success: false,
          message: data.error?.message || 'Donation failed',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to process donation. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Make a Donation</CardTitle>
          <CardDescription>
            Support wildlife conservation through blockchain donations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wallet Address */}
            <div className="space-y-2">
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input
                id="walletAddress"
                type="text"
                placeholder="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                required
                disabled={loading}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                Your Solana wallet address
              </p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="1.5"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={loading}
                  className="flex-1"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'SOL' | 'USDC')}
                  disabled={loading}
                  className="px-4 py-2 border rounded-md bg-background"
                >
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
              <p className="text-sm text-muted-foreground">
                Donations ≥ $50 USD receive an NFT receipt
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Donation...
                </>
              ) : (
                'Donate Now'
              )}
            </Button>
          </form>

          {/* Result Alert */}
          {result && (
            <Alert
              className={`mt-6 ${
                result.success
                  ? 'border-green-500 bg-green-50 text-green-900'
                  : 'border-red-500 bg-red-50 text-red-900'
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className="ml-2">
                {result.message}
                {result.donationId && (
                  <div className="mt-2 space-y-1 text-sm font-mono">
                    <p>Donation ID: {result.donationId}</p>
                    <p>Transaction: {result.txHash}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Info Box */}
          <div className="mt-8 p-4 bg-muted rounded-lg space-y-2">
            <h3 className="font-semibold">How it works:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Enter your Solana wallet address</li>
              <li>Choose donation amount (SOL or USDC)</li>
              <li>Transaction is recorded on Solana blockchain</li>
              <li>Receive NFT receipt if donation ≥ $50</li>
              <li>Track your impact on the dashboard</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
