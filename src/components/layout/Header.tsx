
import { useAuth } from "@/context/AuthContext";
import { useBlockchain } from "@/context/BlockchainContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Wallet } from "lucide-react";

export function Header() {
  const { user, logout, isAdmin, isVoter } = useAuth();
  const { isConnected, account, connectWallet, disconnectWallet } = useBlockchain();

  return (
    <header className="w-full border-b bg-white dark:bg-gray-900 shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blockchain-primary to-blockchain-accent bg-clip-text text-transparent">
            BlockVote
          </h1>
          {user && (
            <span className="hidden md:inline-block text-sm text-muted-foreground">
              {isAdmin ? "Admin Dashboard" : "Voter Portal"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-4">
              {isVoter && (
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <div className="flex items-center gap-2">
                      <span className="hidden md:inline-flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-xs text-muted-foreground truncate max-w-[100px] md:max-w-[200px]">
                          {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
                        </span>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={disconnectWallet}
                        className="hidden md:flex"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={disconnectWallet}
                        className="md:hidden"
                      >
                        <Wallet className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={connectWallet}
                        className="hidden md:flex"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Wallet
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={connectWallet}
                        className="md:hidden"
                      >
                        <Wallet className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1">
                <span className="hidden md:flex items-center gap-1 text-sm">
                  <User className="h-4 w-4" />
                  {user.id}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-muted-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
