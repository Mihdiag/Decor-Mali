// === QuoteDetail.tsx (avec répartition par côté) ===
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = trpc.quotes.getById.useQuery({ id: id! });

  const formatPrice = (a: number) => `${a.toLocaleString("fr-FR")} FCFA`;

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Devis non trouvé</p>
        <Link href="/">
          <Button>Retour</Button>
        </Link>
      </div>
    );

  const { quote, items } = data;

  return (
    <div className="container py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Devis #{quote.id.slice(0, 8)}</CardTitle>
          <CardDescription>Client : {quote.customerName}</CardDescription>
        </CardHeader>
      </Card>

      {items.map((item) => (
        <Card key={item.id} className="mb-4">
          <CardHeader>
            <CardTitle>{item.productName}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {item.productType === "salon" && (
              <>
                <p>Forme : {item.layout}</p>
                <p>
                  Côtés : A={item.sideA} m, B={item.sideB} m{" "}
                  {item.sideC && `, C=${item.sideC} m`}
                </p>
                <p>Matelas : {item.mattressCount} au total</p>
                {item.perSide && (
                  <p>
                    Répartition :{" "}
                    {Object.entries(item.perSide)
                      .filter(([_, v]) => v > 0)
                      .map(([k, v]) => `Côté ${k} → ${v}`)
                      .join(", ")}
                  </p>
                )}
                <p>Coins : {item.cornerCount}</p>
              </>
            )}
            <p className="pt-2 border-t">Sous-total : {formatPrice(item.subtotal)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
