import { FeedbackForm } from './components/FeedbackForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-4 pb-24 sm:pt-6 sm:pb-28 md:pt-8 md:pb-32">
        <div className="flex flex-col items-center justify-start min-h-screen py-4">
          <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
            <div className="text-center space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                用户反馈
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                您的意见对我们很重要
              </p>
            </div>
            <FeedbackForm />
          </div>
        </div>
      </main>
    </div>
  );
}
