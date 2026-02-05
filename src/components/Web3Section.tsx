import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users, MessageCircle, Film, Coins, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Web3Section = () => {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error(`Failed to copy ${label}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Web3 & Community Development
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Building decentralized communities through token ecosystems, social engagement, and interactive experiences since 2015.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* $DrQ - Graduated Token */}
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30 overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-green-500/20 shrink-0">
                <Coins className="w-8 h-8 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-foreground">$DrQ</h3>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    Graduated
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Solana token on Raydium/PumpSwap • ~$4.8K Market Cap
                </p>
                <div className="mb-3 p-2 rounded-lg bg-background/50 border border-green-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Ethereum ERC-20 Contract:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-green-400 font-mono break-all">
                      0x78B5290269740033B05BD8D71c97331295eB5918
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={() => copyToClipboard('0x78B5290269740033B05BD8D71c97331295eB5918', 'Contract address')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
                  <div>
                    <span className="text-foreground font-medium">967</span> Makers
                  </div>
                  <div>
                    <span className="text-foreground font-medium">$234K</span> Volume
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a 
                      href="https://dexscreener.com/solana/7atyeddgmpvmg3a17bdrdyf2tcsk8xzgvhqqot3crfej" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      DexScreener
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a 
                      href="https://pump.fun/coin/8Ettar7hNMaA84jMyBDCYHCwky2ZxS5NxtdeEXyGpump" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Pump.fun
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Q - Mirror Coin */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/30 overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20 shrink-0">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-foreground">Q</h3>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Community
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Mirror coin of $DrQ with social interactive metadata
                </p>
                <div className="mb-3 p-2 rounded-lg bg-background/50 border border-purple-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Solana Mint Address:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-purple-400 font-mono break-all">
                      5S7iGKkzDEXu1WtomXkD1z2M1s5UZPrX1GSeoY4pump
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={() => copyToClipboard('5S7iGKkzDEXu1WtomXkD1z2M1s5UZPrX1GSeoY4pump', 'Mint address')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/80 mb-4">
                  Public community channel for broader engagement, complementing the private holders chat.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a 
                      href="https://pump.fun/coin/5S7iGKkzDEXu1WtomXkD1zs2M1s5UZPrX1GSeoY4pump" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Pump.fun
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a 
                      href="https://t.me/qdrqchat" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Telegram
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Features */}
      <Card className="max-w-5xl mx-auto bg-gradient-to-r from-orange-500/5 via-accent/5 to-primary/5 border-orange-500/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 rounded-2xl bg-orange-500/10 shrink-0">
              <Film className="w-10 h-10 text-orange-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-foreground mb-1">
                Friday Movie Nights @ dienull
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                Community building through shared experiences • Admin: bearycool
              </p>
              <p className="text-xs text-muted-foreground/70 mb-4">
                Using custom CSS developed in 2015 to create interactive viewing experiences
              </p>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a 
                  href="https://cytu.be/r/dienull" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Join Movie Night
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ENS Domains */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">ENS Domains</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="outline" className="px-4 py-2 text-sm bg-primary/5">
            drq.eth
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm bg-muted/50">
            josefkurkedwards.eth
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm bg-muted/50">
            drqsatoshin.eth
          </Badge>
        </div>
      </div>
    </div>
  );
};
