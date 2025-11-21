import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Download, Video, Shield, Zap, Link as LinkIcon, Copy, CheckCircle2, Loader2, Instagram, Clock, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { fetchVideoRequestSchema, type VideoMetadata } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(fetchVideoRequestSchema),
    defaultValues: {
      url: "",
    },
  });

  const fetchVideoMutation = useMutation({
    mutationFn: async (data: { url: string }) => {
      const response = await apiRequest<VideoMetadata>("POST", "/api/fetch-video", data);
      return response;
    },
    onSuccess: (data) => {
      setVideoData(data);
      toast({
        title: "Video found!",
        description: "Your video is ready to download.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch video. Please check the URL and try again.",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    setVideoData(null);
    fetchVideoMutation.mutate(data);
  });

  const downloadMutation = useMutation({
    mutationFn: async (downloadUrl: string) => {
      setDownloadProgress(0);
      
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error("Failed to download video");
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      let loaded = 0;
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          chunks.push(value);
          loaded += value.length;
          
          if (total > 0) {
            const progress = Math.round((loaded / total) * 100);
            setDownloadProgress(progress);
          }
        }
      }

      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'instagram-video.mp4';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setDownloadProgress(100);
    },
    onSuccess: () => {
      toast({
        title: "Download complete!",
        description: "Your video has been downloaded successfully.",
      });
      setTimeout(() => setDownloadProgress(0), 2000);
    },
    onError: (error: Error) => {
      setDownloadProgress(0);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message || "Failed to download video. Please try again.",
      });
    },
  });

  const handleDownload = () => {
    if (videoData?.downloadUrl) {
      downloadMutation.mutate(videoData.downloadUrl);
    }
  };

  const handleCopyUrl = () => {
    if (videoData?.downloadUrl) {
      navigator.clipboard.writeText(window.location.origin + videoData.downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Download URL copied to clipboard.",
      });
    }
  };

  const handleShare = async () => {
    if (videoData?.url) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Instagram Video',
            text: 'Check out this Instagram video',
            url: videoData.url,
          });
          toast({
            title: "Shared!",
            description: "Video link shared successfully.",
          });
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            navigator.clipboard.writeText(videoData.url);
            toast({
              title: "Link copied!",
              description: "Share link copied to clipboard.",
            });
          }
        }
      } else {
        navigator.clipboard.writeText(videoData.url);
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">InstaDown</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main>
        <section className="py-16 md:py-24 min-h-[70vh] flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Download Instagram Videos{" "}
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                    Instantly
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground">
                  Save Reels, IGTV, and video posts in seconds. Free, fast, and no watermarks.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder="Paste Instagram video URL here..."
                                className="h-14 pl-12 text-base rounded-xl shadow-lg"
                                disabled={fetchVideoMutation.isPending}
                                data-testid="input-instagram-url"
                              />
                            </div>
                            <Button
                              type="submit"
                              size="lg"
                              className="h-14 px-8 rounded-xl font-semibold"
                              disabled={fetchVideoMutation.isPending}
                              data-testid="button-fetch-video"
                            >
                              {fetchVideoMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                  Fetching...
                                </>
                              ) : (
                                <>
                                  <Download className="mr-2 h-5 w-5" />
                                  Get Video
                                </>
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>

              {videoData && (
                <Card className="rounded-2xl shadow-xl border-2 animate-in fade-in slide-in-from-bottom-4 duration-500" data-testid="card-video-preview">
                  <CardHeader className="space-y-0 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold" data-testid="text-video-username">
                          {videoData.username || "Instagram User"}
                        </p>
                        {videoData.type && (
                          <p className="text-sm text-muted-foreground capitalize" data-testid="text-video-type">
                            {videoData.type}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {videoData.thumbnail && (
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                        <img
                          src={videoData.thumbnail}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                          data-testid="img-video-thumbnail"
                        />
                      </div>
                    )}

                    <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
                      {videoData.username && (
                        <div className="flex items-center gap-1" data-testid="text-video-metadata-username">
                          <span className="font-medium">@{videoData.username}</span>
                        </div>
                      )}
                      {videoData.duration && (
                        <div className="flex items-center gap-1" data-testid="text-video-duration">
                          <Clock className="w-4 h-4" />
                          <span>{Math.floor(videoData.duration / 60)}:{String(videoData.duration % 60).padStart(2, '0')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1" data-testid="text-video-views">
                        <Eye className="w-4 h-4" />
                        <span>High Quality</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" data-testid="label-quality-selector">
                        Quality
                      </label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          disabled
                          data-testid="button-quality-hd"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          HD (Best Available)
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Downloading the highest quality available from Instagram
                      </p>
                    </div>

                    {downloadMutation.isPending && downloadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Downloading...</span>
                          <span className="font-medium" data-testid="text-download-progress">{downloadProgress}%</span>
                        </div>
                        <Progress value={downloadProgress} className="h-2" data-testid="progress-download" />
                      </div>
                    )}

                    <div className="space-y-3">
                      <Button
                        onClick={handleDownload}
                        size="lg"
                        className="w-full h-12 rounded-xl font-semibold"
                        disabled={downloadMutation.isPending}
                        data-testid="button-download-video"
                      >
                        {downloadMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-5 w-5" />
                            Download Video
                          </>
                        )}
                      </Button>
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={handleCopyUrl}
                          variant="outline"
                          size="lg"
                          className="flex-1 h-12 rounded-xl"
                          data-testid="button-copy-url"
                        >
                          {copied ? (
                            <>
                              <CheckCircle2 className="mr-2 h-5 w-5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-5 w-5" />
                              Copy URL
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleShare}
                          variant="outline"
                          size="lg"
                          className="flex-1 h-12 rounded-xl"
                          data-testid="button-share"
                        >
                          <Share2 className="mr-2 h-5 w-5" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" data-testid="heading-how-it-works">
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    number: "1",
                    icon: Copy,
                    title: "Copy URL",
                    description: "Copy the Instagram video link from your browser or app",
                  },
                  {
                    number: "2",
                    icon: LinkIcon,
                    title: "Paste Link",
                    description: "Paste the URL into the input field above",
                  },
                  {
                    number: "3",
                    icon: Download,
                    title: "Download",
                    description: "Click download and save the video to your device",
                  },
                ].map((step) => (
                  <Card key={step.number} className="text-center p-6 hover-elevate" data-testid={`card-step-${step.number}`}>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white font-bold flex items-center justify-center mx-auto mb-4 text-lg" data-testid={`text-step-number-${step.number}`}>
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold mb-2" data-testid={`heading-step-title-${step.number}`}>{step.title}</h3>
                    <p className="text-muted-foreground" data-testid={`text-step-description-${step.number}`}>{step.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" data-testid="heading-features">
                Why Choose InstaDown?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    icon: Zap,
                    title: "Lightning Fast",
                    description: "Download videos in seconds with our optimized servers. No waiting, no delays.",
                  },
                  {
                    icon: Shield,
                    title: "100% Safe & Secure",
                    description: "Your privacy matters. We don't store your data or track your downloads.",
                  },
                  {
                    icon: Video,
                    title: "High Quality Downloads",
                    description: "Get the best quality available. Download videos in their original resolution.",
                  },
                  {
                    icon: Download,
                    title: "No Watermarks",
                    description: "Clean downloads without any logos or watermarks added to your videos.",
                  },
                ].map((feature, index) => (
                  <Card key={feature.title} className="p-6 hover-elevate" data-testid={`card-feature-${index + 1}`}>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2" data-testid={`heading-feature-title-${index + 1}`}>{feature.title}</h3>
                        <p className="text-muted-foreground" data-testid={`text-feature-description-${index + 1}`}>{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-6 text-sm">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-faq">
                  FAQ
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy">
                  Privacy
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms">
                  Terms
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">
                  Contact
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                InstaDown is a free Instagram video downloader. We are not affiliated with Instagram or Meta.
              </p>
              <p className="text-sm text-muted-foreground">
                Please respect copyright and only download videos you have permission to use.
              </p>
              <p className="text-xs text-muted-foreground">
                © 2024 InstaDown. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
