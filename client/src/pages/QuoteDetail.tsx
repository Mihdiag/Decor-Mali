import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { formatPrice } from "@/utils/formatPrice";

interface QuoteDetailProps {
  quote: {
    id?: string;
    date?: string;
    type: "salon" | "carpet" | "curtain";
    data: any;
    result: any;
  };
}

export default function QuoteDetail({ quote }: QuoteDetailProps) {
  if (!quote) return <p className="text-center py-10">Aucun devis sélectionné.</p>;

  const { type, data, result } = quote;
  const date = quote.date ? new Date(quote.date) : new Date();

  return (
    <div className="container py-10 max-w-3xl">
      <Card className="rounded-2xl shadow-lg border">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-xl font-bold flex justify-between items-center">
            <span>
              🧾 Devis – {type === "salon" ? "Salon Marocain" : type === "carpet" ? "Tapis" : "Rideaux"}
            </span>
            <span className="text-sm text-muted-foreground">
              {format(date, "dd/MM/yyyy")}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {type === "salon" && (
            <>
              <section className="space-y-2">
                <h3 className="text-lg font-semibold">🛋️ Configuration du Salon</h3>
                <p>
                  <strong>Forme :</strong> {data.layout}
                </p>
                <p>
                  <strong>Côté A :</strong> {data.sideA || 0} m |{" "}
                  <strong>Côté B :</strong> {data.sideB || 0} m{" "}
                  {data.layout === "U" && (
                    <>
                      | <strong>Côté C :</strong> {data.sideC || 0} m
                    </>
                  )}
                </p>
                <p>
                  <strong>Longueur du matelas :</strong> {data.mattressLength} cm
                </p>
              </section>

              <section className="space-y-2 pt-4 border-t">
                <h3 className="text-lg font-semibold">📏 Calculs Automatiques</h3>
                <p>
                  <strong>Matelas totaux :</strong>{" "}
                  {result?.suggestion?.mattressCount || 0}
                </p>
                <p>
                  <strong>Coins :</strong> {result?.suggestion?.cornerCount || 0}
                </p>
                <p>
                  <strong>Répartition :</strong>{" "}
                  Côté A : {result?.suggestion?.perSide?.A || 0} |{" "}
                  Côté B : {result?.suggestion?.perSide?.B || 0}{" "}
                  {data.layout === "U" && (
                    <>| Côté C : {result?.suggestion?.perSide?.C || 0}</>
                  )}
                </p>
              </section>

              <section className="space-y-2 pt-4 border-t">
                <h3 className="text-lg font-semibold">💰 Détail du Prix</h3>
                <ul className="space-y-1 text-sm">
                  {result?.breakdown?.mattresses && (
                    <li>
                      Matelas : {formatPrice(result.breakdown.mattresses)}
                    </li>
                  )}
                  {result?.breakdown?.corners && (
                    <li>
                      Coins : {formatPrice(result.breakdown.corners)}
                    </li>
                  )}
                  {result?.breakdown?.arms && (
                    <li>
                      Bras : {formatPrice(result.breakdown.arms)}
                    </li>
                  )}
                  {result?.breakdown?.smallTable && (
                    <li>
                      Petite table : {formatPrice(result.breakdown.smallTable)}
                    </li>
                  )}
                  {result?.breakdown?.bigTable && (
                    <li>
                      Grande table : {formatPrice(result.breakdown.bigTable)}
                    </li>
                  )}
                  {result?.breakdown?.transport && (
                    <li>
                      Transport : {formatPrice(result.breakdown.transport)}
                    </li>
                  )}
                  {result?.breakdown?.profit && (
                    <li>
                      Bénéfice : {formatPrice(result.breakdown.profit)}
                    </li>
                  )}
                </ul>

                <div className="pt-2 border-t mt-2">
                  <p>
                    <strong>Sous-total :</strong>{" "}
                    {formatPrice(result.subtotal)}
                  </p>
                  {result.deliveryFee > 0 && (
                    <p>
                      <strong>Livraison :</strong>{" "}
                      {formatPrice(result.deliveryFee)}
                    </p>
                  )}
                  <p className="text-lg font-bold pt-2">
                    Total : {formatPrice(result.total)}
                  </p>
                </div>
              </section>
            </>
          )}

          {type === "carpet" && (
            <>
              <section className="space-y-2">
                <h3 className="text-lg font-semibold">🧶 Détails du Tapis</h3>
                <p>
                  <strong>Dimensions :</strong> {data.length} × {data.width} m
                </p>
                <p>
                  <strong>Prix total :</strong> {formatPrice(result.total)}
                </p>
              </section>
            </>
          )}

          {type === "curtain" && (
            <>
              <section className="space-y-2">
                <h3 className="text-lg font-semibold">🪟 Détails des Rideaux</h3>
                <p>
                  <strong>Dimensions :</strong> {data.length} × {data.width} m
                </p>
                <p>
                  <strong>Qualité :</strong> {data.quality}
                </p>
                <p>
                  <strong>Prix total :</strong> {formatPrice(result.total)}
                </p>
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
