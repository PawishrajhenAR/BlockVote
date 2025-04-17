import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { KeyRound, UserRound, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const Login = () => {
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Sign up state  
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { login, signUp } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupPassword !== confirmPassword) {
      return alert("Passwords don't match");
    }
    
    setSignupLoading(true);
    
    try {
      const success = await signUp(signupEmail, signupPassword, isAdmin);
      if (success) {
        // Stay on login page but switch to login tab
        document.getElementById('login-tab')?.click();
      }
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blockchain-primary via-blockchain-secondary to-blockchain-accent bg-clip-text text-transparent">
            BlockVote
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Secure Blockchain-Based Voting System
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
            <CardDescription>
              Enter your credentials to access the voting system
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger id="login-tab" value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-blockchain-primary hover:bg-blockchain-secondary text-white"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isAdmin" 
                      checked={isAdmin}
                      onCheckedChange={(checked) => setIsAdmin(!!checked)}
                    />
                    <label
                      htmlFor="isAdmin"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Create as Admin Account
                    </label>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-blockchain-primary hover:bg-blockchain-secondary text-white"
                    disabled={signupLoading}
                  >
                    {signupLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="text-center text-xs text-muted-foreground p-4">
            <p>By signing in, you agree to our Terms of Service</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
