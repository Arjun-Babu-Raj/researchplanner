
'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Download, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { Input } from './ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface AppHeaderProps {
  onExport?: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function AppHeader({ onExport, apiKey, onApiKeyChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center mr-6">
            <Logo className="h-6 w-6 mr-2 text-primary" />
            <span className="font-headline text-lg font-bold">Research Planner</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="relative w-full max-w-xs">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    type="password"
                    placeholder="Enter your Gemini API Key"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    className="pl-9"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your key is used only for your session and is not stored.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
