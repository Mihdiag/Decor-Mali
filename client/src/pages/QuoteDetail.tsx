import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = trpc.quotes.getById.useQuery({ id: id! });

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} FCFA`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { label: "En attente", variant: "secondary", icon: Clock },
      validated: { label: "Validé", variant: "default", icon: CheckCircle },
      rejected: { label: "Rejeté", variant: "destructive", icon: XCircle },
      converted: { label: "Converti en commande", variant: "default", icon: CheckCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Devis non trouvé</p>
        <Link href="/">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    );
  }

  const { quote, items } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Détails du Devis</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        {/* Quote Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Devis #{quote.id.slice(0, 8)}</CardTitle>
                <CardDescription>
                  Créé le {new Date(quote.createdAt!).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </CardDescription>
              </div>
              {getStatusBadge(quote.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Informations Client</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Nom :</span> {quote.customerName}</p>
                  {quote.customerEmail && (
                    <p><span className="text-muted-foreground">Email :</span> {quote.customerEmail}</p>
                  )}
                  <p><span className="text-muted-foreground">Téléphone :</span> {quote.customerPhone}</p>
                  {quote.customerAddress && (
                    <p><span className="text-muted-foreground">Adresse :</span> {quote.customerAddress}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Montant Total</h4>
                <p className="text-3xl font-bold text-primary">{formatPrice(quote.totalAmount)}</p>
              </div>
            </div>

            {quote.notes && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Notes du client</h4>
                <p className="text-sm text-muted-foreground">{quote.notes}</p>
              </div>
            )}

            {quote.adminNotes && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Notes de l'administrateur</h4>
                <p className="text-sm text-muted-foreground">{quote.adminNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote Items */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Articles</h2>
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.productName}</CardTitle>
                <CardDescription>Type : {item.productType}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.productType === "salon" && (
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    {item.mattressLength && (
                      <p><span className="text-muted-foreground">Longueur matelas :</span> {item.mattressLength} cm</p>
                    )}
                    {item.mattressCount && (
                      <p><span className="text-muted-foreground">Nombre de matelas :</span> {item.mattressCount}</p>
                    )}
                    {item.cornerCount !== null && item.cornerCount !== undefined && (
                      <p><span className="text-muted-foreground">Nombre de coins :</span> {item.cornerCount}</p>
                    )}
                    {item.armCount && (
                      <p><span className="text-muted-foreground">Nombre de bras :</span> {item.armCount}</p>
                    )}
                    {item.fabricName && (
                      <p><span className="text-muted-foreground">Tissu :</span> {item.fabricName}</p>
                    )}
                    {item.thickness && (
                      <p><span className="text-muted-foreground">Épaisseur :</span> {item.thickness} cm</p>
                    )}
                    {item.hasSmallTable && (
                      <p className="text-primary">✓ Petite table incluse</p>
                    )}
                    {item.hasBigTable && (
                      <p className="text-primary">✓ Grande table incluse</p>
                    )}
                  </div>
                )}

                {item.productType === "tapis" && (
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    {item.length && (
                      <p><span className="text-muted-foreground">Longueur :</span> {item.length} m</p>
                    )}
                    {item.width && (
                      <p><span className="text-muted-foreground">Largeur :</span> {item.width} m</p>
                    )}
                  </div>
                )}

                {item.needsDelivery && (
                  <div className="pt-2 border-t">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Livraison :</span> {item.deliveryLocation || "Bamako"}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="text-xl font-bold">{formatPrice(item.subtotal)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status Message */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="pt-6">
            {quote.status === "pending" && (
              <div className="text-center space-y-2">
                <Clock className="h-12 w-12 text-primary mx-auto" />
                <h3 className="font-semibold">Devis en attente de validation</h3>
                <p className="text-sm text-muted-foreground">
                  Un responsable de DECOR MALI vous contactera bientôt pour valider votre devis et planifier une visite sur place.
                </p>
              </div>
            )}
            {quote.status === "validated" && (
              <div className="text-center space-y-2">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="font-semibold">Devis validé</h3>
                <p className="text-sm text-muted-foreground">
                  Votre devis a été validé. Notre équipe vous contactera pour finaliser votre commande.
                </p>
              </div>
            )}
            {quote.status === "rejected" && (
              <div className="text-center space-y-2">
                <XCircle className="h-12 w-12 text-destructive mx-auto" />
                <h3 className="font-semibold">Devis non validé</h3>
                <p className="text-sm text-muted-foreground">
                  Votre devis n'a pas pu être validé. Veuillez nous contacter pour plus d'informations.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

