import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background border-t-4 border-primary">
      <Card className="w-full max-w-sm mx-4">
        <form>
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Fitness Tracker
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email below to login or create an account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {searchParams?.error && (
              <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-medium text-center">
                {searchParams.error}
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                suppressHydrationWarning
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                suppressHydrationWarning
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button formAction={login} type="submit" className="w-full">
              Sign In
            </Button>
            <Button formAction={signup} type="submit" variant="secondary" className="w-full">
              Create an Account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
