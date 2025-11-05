
"use client";

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Wand2, RefreshCw, AlertTriangle, BookOpen } from 'lucide-react';
import { generateSectionAction, refineSectionAction, literatureReviewAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { FrameworkValidationDialog } from './framework-validation-dialog';
import type { GenerateStudySectionInput } from '@/ai/flows/generate-study-section';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';

type SectionKey = 'Objectives' | 'Methodology' | 'SampleSize' | 'DataCollection' | 'Analysis' | 'LiteratureReview' | 'Introduction';

interface StudySectionCardProps {
  sectionKey: SectionKey;
  title: string;
  description: string;
  studyTitle: string;
  apiKey: string;
}

type Article = {
    title: string;
    author: string;
    year: string;
    studyDesign: string;
    citation: string;
    summary: string;
};

type KeyConcept = {
    concept: string;
    note: string;
}

type LiteratureReviewContent = {
    keyConcepts: KeyConcept[];
    articles: Article[];
}

export function StudySectionCard({ sectionKey, title, description, studyTitle, apiKey }: StudySectionCardProps) {
  const [content, setContent] = useState('');
  const [litReviewContent, setLitReviewContent] = useState<Partial<LiteratureReviewContent>>({});
  const [feedback, setFeedback] = useState('');
  const [critique, setCritique] = useState<{ critique: string; suggestions: string } | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const [isRefining, startRefining] = useTransition();
  const { toast } = useToast();
  
  const isLitReview = sectionKey === 'LiteratureReview';

  const getStorageKey = useCallback(() => {
    if (!studyTitle) return null;
    return `research-planner-${studyTitle}-${sectionKey}`;
  }, [studyTitle, sectionKey]);
  
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    const storageKey = getStorageKey();
    if (storageKey) {
      localStorage.setItem(storageKey, newContent);
    }
    
    if (isLitReview) {
      try {
        setLitReviewContent(JSON.parse(newContent));
      } catch (e) {
        setLitReviewContent({});
      }
    }
  }, [getStorageKey, isLitReview]);


  useEffect(() => {
    const storageKey = getStorageKey();
    const savedContent = storageKey ? localStorage.getItem(storageKey) : null;
    if (savedContent) {
      handleContentChange(savedContent);
    } else {
        setContent('');
        if (isLitReview) {
            setLitReviewContent({});
        }
    }

    const savedCritiqueKey = storageKey ? `${storageKey}-critique` : null;
    const savedCritique = savedCritiqueKey ? localStorage.getItem(savedCritiqueKey) : null;

    if(savedCritique) {
      setCritique(JSON.parse(savedCritique));
    } else {
        setCritique(null);
    }
  }, [getStorageKey, handleContentChange, studyTitle, isLitReview]);

  useEffect(() => {
    const handleStorageUpdate = (event: Event) => {
      const storageKey = getStorageKey();
      if (!storageKey) return;

      const customEvent = event as CustomEvent<{ key: string }>;
      if (customEvent.detail?.key === storageKey) {
        const updatedContent = localStorage.getItem(storageKey);
        if (updatedContent !== null) {
          handleContentChange(updatedContent);
        }
      }
    };

    window.addEventListener('storage-update', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage-update', handleStorageUpdate);
    };
  }, [getStorageKey, handleContentChange]);

  const handleCritiqueUpdate = (newCritique: { critique: string; suggestions: string } | null) => {
    setCritique(newCritique);
    const storageKey = getStorageKey();
    if (!storageKey) return;

    if (newCritique) {
      localStorage.setItem(`${storageKey}-critique`, JSON.stringify(newCritique));
    } else {
      localStorage.removeItem(`${storageKey}-critique`);
    }
  };

  const getDependencyContent = (depSectionKey: SectionKey): string | null => {
      if (!studyTitle) return null;
      const key = `research-planner-${studyTitle}-${depSectionKey}`;
      return localStorage.getItem(key);
  };

  const handleGenerate = () => {
    if (!studyTitle) {
      toast({ title: 'Study Title Required', description: 'Please enter a study title before generating content.', variant: 'destructive' });
      return;
    }
    if (!apiKey) {
      toast({ title: 'API Key Required', description: 'Please enter your Gemini API key in the header.', variant: 'destructive' });
      return;
    }
    startGenerating(async () => {
      if (sectionKey === 'LiteratureReview') {
        const result = await literatureReviewAction({ studyTitle, apiKey });
        if (result.success && result.data) {
          const { introduction, ...litReviewData } = result.data;
          
          handleContentChange(JSON.stringify(litReviewData, null, 2));

          if (litReviewData.articles && litReviewData.articles.length > 0) {
             toast({
                title: "Literature Review Generated",
                description: "The 'Introduction' section has also been populated.",
            });
          } else {
             toast({
                title: "No Articles Found",
                description: "The 'Introduction' has been updated with feedback.",
                variant: 'destructive'
            });
          }
          
          const introStorageKey = `research-planner-${studyTitle}-Introduction`;
          localStorage.setItem(introStorageKey, introduction);
          window.dispatchEvent(new CustomEvent('storage-update', { detail: { key: introStorageKey } }));

        } else {
          toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
        return;
      }
      
      const input: GenerateStudySectionInput = {
        studyTitle,
        sectionType: sectionKey as any, // Cast because we've extended the type locally
      };

      const introContent = getDependencyContent('Introduction');
      if (introContent) {
        input.introduction = introContent;
      }
      
      const objectivesContent = getDependencyContent('Objectives');
      if (sectionKey === 'Analysis' || sectionKey === 'Methodology') {
        if (!objectivesContent) {
            toast({ title: 'Objectives Required', description: `Please generate the Objectives section first.`, variant: 'destructive' });
            return;
        }
        input.objectives = objectivesContent;
      }
      
      const methodologyContent = getDependencyContent('Methodology');
      if (sectionKey === 'DataCollection' || sectionKey === 'SampleSize' || sectionKey === 'Analysis') {
        if (!methodologyContent) {
            toast({ title: 'Methodology Required', description: `Please generate the Methodology section first.`, variant: 'destructive' });
            return;
        }
        input.methodology = methodologyContent;
      }
      
      if(sectionKey === 'Analysis' && objectivesContent) {
          input.objectives = objectivesContent;
      }


      const result = await generateSectionAction({ ...input, apiKey });

      if (result.success && result.data) {
        handleContentChange(result.data.sectionContent);
        toast({
          title: "Section Generated",
          description: `Initial content for ${title} has been created.`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  const handleRefine = () => {
    if (!apiKey) {
      toast({ title: 'API Key Required', description: 'Please enter your Gemini API key in the header.', variant: 'destructive' });
      return;
    }
    if (!feedback.trim()) {
      toast({ title: 'Feedback Required', description: 'Please enter your feedback to refine the content.', variant: 'destructive' });
      return;
    }
    startRefining(async () => {
      const result = await refineSectionAction({
        sectionTitle: title,
        existingContent: content,
        userFeedback: feedback,
        apiKey
      });
      if (result.success && result.data) {
        handleContentChange(result.data.refinedContent);
        setFeedback('');
        toast({
          title: 'Section Refined',
          description: 'The content has been updated based on your feedback.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  const isLoading = isGenerating || isRefining;
  const isIntro = sectionKey === 'Introduction';

  return (
    <Card className={`flex flex-col ${isLitReview ? 'lg:col-span-2' : ''}`}>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">{title}</CardTitle>
        <CardDescription>
            {isIntro ? "This section is auto-generated by the 'Review of Literature' step. Refine it with your own feedback." : description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        {isLoading && (
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <p className="text-center text-sm text-muted-foreground pt-4">AI is working... This may take a moment.</p>
          </div>
        )}
        {!isLoading && isLitReview && litReviewContent.articles && litReviewContent.articles.length > 0 && (
          <div className="space-y-6">
            {litReviewContent.keyConcepts && Array.isArray(litReviewContent.keyConcepts) && litReviewContent.keyConcepts.length > 0 && (
                 <div>
                    <h4 className="font-semibold mb-4 text-lg">Key Concepts</h4>
                    <div className="space-y-4">
                    {litReviewContent.keyConcepts.map((concept, index) => (
                        <div key={index}>
                            <h5 className="font-semibold">{concept.concept}</h5>
                            <p className="text-muted-foreground">{concept.note}</p>
                        </div>
                    ))}
                    </div>
                </div>
            )}
            <div className="w-full overflow-x-auto">
                <Table>
                    <TableCaption>A summary of the top relevant articles from PubMed.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Author(s)</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Study Design</TableHead>
                            <TableHead>Summary</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {litReviewContent.articles.map((article, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium max-w-xs">{article.title}</TableCell>
                                <TableCell>{article.author}</TableCell>
                                <TableCell>{article.year}</TableCell>
                                <TableCell>{article.studyDesign}</TableCell>
                                <TableCell className="text-muted-foreground max-w-md">{article.summary}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          </div>
        )}
        {!isLoading && !isLitReview && (
          <Textarea
            placeholder={isIntro ? "Generate the 'Review of Literature' to populate this section." : "Generate or manually enter content here..."}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[150px] flex-grow text-base bg-transparent"
            rows={8}
            readOnly={isLoading || (isIntro && !content)}
          />
        )}
        {!isLoading && isLitReview && (!litReviewContent.articles || litReviewContent.articles.length === 0) && (
             <div className="text-center py-10 text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 mb-4" />
                <p>Click "Generate" to search PubMed and create a literature review.</p>
             </div>
        )}
        {critique && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="font-bold">Framework Validation Feedback</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
                <p><strong>Critique:</strong> {critique.critique}</p>
                <p><strong>Suggestion:</strong> {critique.suggestions}</p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        {content && !isLitReview && (
          <div className="w-full space-y-2">
            <p className="text-sm font-medium">Refine with Feedback</p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 'Make it more concise' or 'Add a point about...'"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isLoading}
              />
              <Button onClick={handleRefine} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isRefining ? 'animate-spin' : ''}`} />
                <span className="ml-2 hidden sm:inline">Refine</span>
              </Button>
            </div>
          </div>
        )}
        <div className="flex justify-between w-full items-center">
            <Button onClick={handleGenerate} disabled={isLoading || (!!content && !isLitReview) || isIntro}>
                <Wand2 className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span className="ml-2">Generate</span>
            </Button>
          {content && !isLitReview && (
            <FrameworkValidationDialog
              sectionKey={sectionKey as any}
              sectionContent={content}
              studyTitle={studyTitle}
              onCritiqueUpdate={handleCritiqueUpdate}
              hasCritique={!!critique}
              apiKey={apiKey}
            />
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
