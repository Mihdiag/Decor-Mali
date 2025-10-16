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

  if (isLoading) {
    return (
      <div className="container py-12 text-center">
        <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
        Chargement du devis...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-12 text-center">
        <XCircle className="h-6 w-6 inline-block mr-2 text-destructive" />
        Devis introuvable
        <div className="mt-6">
          <Link href="/quote">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = (s: string) => {
    switch (s) {
      case "validated":
        return <Badge className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" /> Validé</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejeté</Badge>;
      case "converted":
        return <Badge className="bg-blue-600 text-white">Converti</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>;
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/quote">
          <Button variant="ghost" className="px-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Devis #{data.id}</CardTitle>
          <CardDescription>
            {statusBadge(data.status)} <span className="ml-2">Montant total : <strong>{formatPrice(data.totalAmount)}</strong></span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><strong>Client :</strong> {data.customerName}</p>
          {data.customerPhone && <p><strong>Téléphone :</strong> {data.customerPhone}</p>}
          {data.customerEmail && <p><strong>Email :</strong> {data.customerEmail}</p>}
          {data.customerAddress && <p><strong>Adresse :</strong> {data.customerAddress}</p>}
          {data.notes && <p className="text-muted-foreground">{data.notes}</p>}
        </CardContent>
      </Card>

      {data.items?.map((item: any, idx: number) => (
        <Card key={idx} className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">{item.productName}</CardTitle>
            <CardDescription>Type : {item.productType}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {item.productType === "salon" && (
              <>
                <p>Longueur matelas : {item.mattressLength} cm</p>
                {/* Affiche ces infos seulement si elles existent dans la ligne (compat) */}
                {item.layout && <p>Forme : {item.layout}</p>}
                {item.perSide && (
                  <p>
                    Répartition par côté :{" "}
                    {Object.entries(item.perSide).map(([k, v]) => `Côté ${k} → ${v}`).join(", ")}
                  </p>
                )}
                <p>Coins : {item.cornerCount}</p>
                {typeof item.armCount === "number" && <p>Bras : {item.armCount}</p>}
                {item.hasSmallTable && <p>Petite table incluse</p>}
                {item.hasBigTable && <p>Grande table incluse</p>}
                {item.needsDelivery && <p>Livraison : Oui {item.deliveryLocation ? `(${item.deliveryLocation})` : ""}</p>}
              </>
            )}

            {item.productType === "tapis" && (
              <>
                <p>Dimensions : {item.length}m × {item.width}m</p>
                {item.needsDelivery && <p>Livraison : Oui {item.deliveryLocation ? `(${item.deliveryLocation})` : ""}</p>}
              </>
            )}

            {item.productType === "rideau" && (
              <>
                <p>Dimensions : {item.length}m × {item.width}m</p>
                {item.quality && <p>Qualité : {item.quality}</p>}
                {item.needsDelivery && <p>Livraison : Oui {item.deliveryLocation ? `(${item.deliveryLocation})` : ""}</p>}
              </>
            )}

            <p className="pt-2 border-t">Sous-total : {formatPrice(item.subtotal)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
