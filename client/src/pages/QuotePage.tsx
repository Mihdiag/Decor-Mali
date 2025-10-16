import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calculator } from "lucide-react";

export default function QuotePage() {
  const [activeTab, setActiveTab] = useState<"salon" | "carpet" | "curtain">("salon");

  // salon
  const [salonData, setSalonData] = useState({
    layout: "L",
    sideA: "",
    sideB: "",
    sideC: "",
    mattressLength: "190",
    armCount: 2,
    hasSmallTable: false,
    hasBigTable: false,
    needsDelivery: false,
    deliveryLocation: "",
  });

  const [calculatedPrice, setCalculatedPrice] = useState<any>(null);

  const calculateSalon = trpc.pricing.calculateSalon.useMutation();
  const calculateCarpet = trpc.pricing.calculateCarpet.useMutation();
  const calculateCurtain = trpc.pricing.calculateCurtain.useMutation();

  // Calcul automatique du nombre de matelas et coins
  const computeFromSides = (data: typeof salonData) => {
    const sideA = parseFloat(data.sideA) || 0;
    const sideB = parseFloat(data.sideB) || 0;
    const sideC = parseFloat(data.sideC) || 0;
    const mattressLength = (parseFloat(data.mattressLength) || 190) / 100; // en m
    const isU = data.layout === "U";

    let usableA = Math.max(0, sideA - 1);
    let usableB = Math.max(0, sideB - 1);
    let usableC = isU ? Math.max(0, sideC - 1) : 0;

    if (isU) usableB = Math.max(0, usableB - 2);

    const totalLength = usableA + usableB + usableC;
    const mattressCount = Math.floor(totalLength / mattressLength);
    const cornerCount = isU ? 2 : 1;

    // Répartition des matelas par côté
    const totalUsable = usableA + usableB + usableC;
    const ratioA = totalUsable ? usableA / totalUsable : 0;
    const ratioB = totalUsable ? usableB / totalUsable : 0;
    const ratioC = totalUsable ? usableC / totalUsable : 0;

    const perSide = {
      A: Math.round(mattressCount * ratioA),
      B: Math.round(mattressCount * ratioB),
      C: isU ? Math.round(mattressCount * ratioC) : 0,
    };

    return { mattressCount, cornerCount, perSide };
  };

  const handleCalculate = async () => {
    try {
      if (activeTab === "salon") {
        const computed = computeFromSides(salonData);

        const salonToSend = {
          mattressLength: Number(salonData.mattressLength) || 190,
          mattressCount: computed.mattressCount || 0,
          cornerCount: computed.cornerCount || 0,
          armCount: Number(salonData.armCount) || 2,
          thicknessMultiplier: 100,
          fabricPricePerMeter: 0,
          hasSmallTable: !!salonData.hasSmallTable,
          hasBigTable: !!salonData.hasBigTable,
          needsDelivery: !!salonData.needsDelivery,
          deliveryLocation: salonData.deliveryLocation || "",
        };

        const result = await calculateSalon.mutateAsync(salonToSend);
        result.suggestion = computed;
        setCalculatedPrice(result);
        toast.success("Prix du salon calculé !");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors du calcul du prix.");
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Calculateur de Devis</h1>

      <Tabs defaultValue="salon" onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid grid-cols-3 w-full md:w-[600px] mx-auto mb-6">
          <TabsTrigger value="salon">Salon Marocain</TabsTrigger>
          <TabsTrigger value="carpet">Tapis</TabsTrigger>
          <TabsTrigger value="curtain">Rideaux</TabsTrigger>
        </TabsList>

        <TabsContent value="salon">
          <div className="bg-white rounded-2xl shadow p-6 max-w-2xl mx-auto space-y-4">
            <h2 className="text-lg font-semibold">Configuration du Salon</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Forme</Label>
                <Select
                  value={salonData.layout}
                  onValueChange={(v) => setSalonData((s) => ({ ...s, layout: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="U">U</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Longueur du matelas (cm)</Label>
                <Input
                  type="number"
                  value={salonData.mattressLength}
                  onChange={(e) =>
                    setSalonData((s) => ({ ...s, mattressLength: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label>Côté A (m)</Label>
                <Input
                  type="number"
                  value={salonData.sideA}
                  onChange={(e) => setSalonData((s) => ({ ...s, sideA: e.target.value }))}
                />
              </div>

              <div>
                <Label>Côté B (m)</Label>
                <Input
                  type="number"
                  value={salonData.sideB}
                  onChange={(e) => setSalonData((s) => ({ ...s, sideB: e.target.value }))}
                />
              </div>

              {salonData.layout === "U" && (
                <div>
                  <Label>Côté C (m)</Label>
                  <Input
                    type="number"
                    value={salonData.sideC}
                    onChange={(e) => setSalonData((s) => ({ ...s, sideC: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <Button className="mt-4 gap-2" onClick={handleCalculate}>
              <Calculator className="w-4 h-4" /> Calculer le prix
            </Button>

            {calculatedPrice && (
              <div className="mt-6 border-t pt-4 space-y-2">
                <h3 className="font-semibold">Résultats</h3>
                <p>
                  <strong>Total :</strong> {calculatedPrice.total.toLocaleString("fr-FR")} FCFA
                </p>
                <p>
                  <strong>Matelas :</strong> {calculatedPrice.suggestion.mattressCount}  
                  {" "}({calculatedPrice.suggestion.perSide.A} sur A,{" "}
                  {calculatedPrice.suggestion.perSide.B} sur B
                  {salonData.layout === "U" ? `, ${calculatedPrice.suggestion.perSide.C} sur C` : ""})
                </p>
                <p>
                  <strong>Coins :</strong> {calculatedPrice.suggestion.cornerCount}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
