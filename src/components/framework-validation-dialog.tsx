
"use client";

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { frameworks, type Framework } from '@/lib/frameworks';
import { validateFrameworkAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface FrameworkValidationDialogProps {
  sectionKey: 'Objectives' | 'Methodology' | 'SampleSize' | 'DataCollection' | 'Analysis';
  sectionContent: string;
  studyTitle: string;
  onCritiqueUpdate: (critique: { critique: string; suggestions: string } | null) => void;
  hasCritique: boolean;
  apiKey: string;
}

export function FrameworkValidationDialog({
  sectionKey,
  sectionContent,
  studyTitle,
  onCritiqueUpdate,
  hasCritique,
  apiKey,
}: FrameworkValidationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [validationResult, setValidationResult] = useState<{ critique: string; suggestions: string } | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();
  const { toast } = useToast();

  const availableFrameworks = frameworks[sectionKey] || [];

  const handleValidate = () => {
    if (!apiKey) {
      toast({ title: 'API Key Required', description: 'Please enter your Gemini API key in the header.', variant: 'destructive' });
      return;
    }
    if (!selectedFramework) {
      toast({
        title: 'No Framework Selected',
        description: 'Please choose a framework to validate against.',
        variant: 'destructive',
      });
      return;
    }
    startSubmitting(async () => {
      const result = await validateFrameworkAction({
        planSection: sectionContent,
        frameworkName: selectedFramework.name,
        frameworkPrinciples: selectedFramework.principles,
        apiKey,
      });

      if (result.success && result.data) {
        setValidationResult(result.data);
        onCritiqueUpdate(result.data);
      } else {
        toast({
          title: 'Validation Failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state on close
      setValidationResult(null);
      setSelectedFramework(null);
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={hasCritique ? "secondary" : "outline"}>
            {hasCritique ? <CheckCircle className="h-4 w-4 mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
            Validate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Validate with a Framework</DialogTitle>
          <DialogDescription>
            Select a research framework to evaluate your '{sectionKey}' section for rigor and completeness.
          </DialogDescription>
        </DialogHeader>
        {!validationResult ? (
          <div className="grid gap-4 py-4">
            <RadioGroup onValueChange={(value) => setSelectedFramework(JSON.parse(value))}>
              <div className="space-y-4">
                {availableFrameworks.map((fw) => (
                  <Label
                    key={fw.name}
                    htmlFor={fw.name}
                    className="flex items-start space-x-4 rounded-md border p-4 cursor-pointer hover:bg-accent/50 has-[:checked]:bg-accent/80 has-[:checked]:border-primary"
                  >
                    <RadioGroupItem value={JSON.stringify(fw)} id={fw.name} />
                    <div className="flex-1">
                      <p className="font-semibold">{fw.name}</p>
                      <p className="text-sm text-muted-foreground">{fw.description}</p>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>
        ) : (
          <div className="py-4">
            <Alert variant="default" className="bg-background">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-bold text-lg">AI Methodologist Feedback</AlertTitle>
              <AlertDescription className="mt-2 space-y-4 text-base">
                <div>
                    <h4 className="font-semibold text-foreground">Critique:</h4>
                    <p className="text-muted-foreground">{validationResult.critique}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground">Suggestion:</h4>
                    <p className="text-muted-foreground">{validationResult.suggestions}</p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
        <DialogFooter>
          {!validationResult ? (
            <Button onClick={handleValidate} disabled={!selectedFramework || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Validate Section
            </Button>
          ) : (
             <DialogClose asChild>
                <Button type="button">Close</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
