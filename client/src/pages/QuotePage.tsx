// === QuotePage.tsx (avec répartition par côté) ===
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Calculator, Send, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function QuotePage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"salon" | "carpet" | "curtain">("salon");

  const [salonData, setSalonData] = useState({
    layout: "L" as "L" | "U",
    sideA: 3.0,
    sideB: 2.5,
    sideC: 2.0,
    mattressLength: 190, // cm
    mattressCount: 3,
    cornerCount: 2,
    armCount: 2,
    hasSmallTable: false,
    hasBigTable: false,
    needsDelivery: false,
    deliveryLocation: "",
  });

  const [carpetData, setCarpetData] = useState({
    length: 5,
    width: 4,
    needsDelivery: false,
    deliveryLocation: "",
  });

  const [curtainData, setCurtainData] = useState({
    length: 2.5,
    width: 3,
    quality: "dubai" as "dubai" | "quality2" | "quality3",
    needsDelivery: false,
    deliveryLocation: "",
  });

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [calculatedPrice, setCalculatedPrice] = useState<any>(null);

  const calculateSalon = trpc.pricing.calculateSalon.useMutation();
  const calculateCarpet = trpc.pricing.calculateCarpet.useMutation();
  const calculateCurtain = trpc.pricing.calculateCurtain.useMutation();
  const createQuote = trpc.quotes.create.useMutation();

  // ✅ Calcul complet avec répartition par côté
  const computeFromSides = (data: typeof salonData) => {
    const mattressLenM = data.mattressLength / 100;
    const corners = data.layout === "L" ? 1 : 2;

    const sideA = Math.max(0, Number(data.sideA) || 0);
    const sideB = Math.max(0, Number(data.sideB) || 0);
    const sideC = Math.max(0, Number(data.sideC) || 0);

    let usable = { A: 0, B: 0, C: 0 };

    if (data.layout === "L") {
      usable.A = Math.max(0, sideA - 1);
      usable.B = Math.max(0, sideB - 1);
    } else {
      usable.A = Math.max(0, sideA - 1);
      usable.B = Math.max(0, sideB - 2);
      usable.C = Math.max(0, sideC - 1);
    }

    const perSide = {
      A: Math.floor(usable.A / mattressLenM),
      B: Math.floor(usable.B / mattressLenM),
      C: data.layout === "U" ? Math.floor(usable.C / mattressLenM) : 0,
    };

    const totalMattress = perSide.A + perSide.B + perSide.C;
    const totalUsable = (usable.A + usable.B + usable.C).toFixed(2);

    return {
      mattressCount: totalMattress,
      cornerCount: corners,
      availableLength: Number(totalUsable),
      perSide,
      usable,
      mattressLengthMeters: mattressLenM,
    };
  };

  const handleCalculate = async () => {
    try {
      if (activeTab === "salon") {
        const computed = computeFromSides(salonData);
        const salonToSend = {
          ...salonData,
          mattressCount: computed.mattressCount,
          cornerCount: computed.cornerCount,
        };
        const result = await calculateSalon.mutateAsync(salonToSend as any);
        result.suggestion = computed;
        setCalculatedPrice(result);
      } else if (activeTab === "carpet") {
        const result = await calculateCarpet.mutateAsync(carpetData);
        setCalculatedPrice(result);
      } else {
        const result = await calculateCurtain.mutateAsync(curtainData);
        setCalculatedPrice(result);
      }
      toast.success("Prix calculé avec succès !");
    } catch {
      toast.error("Erreur lors du calcul du prix");
    }
  };

  const handleSubmitQuote = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error("Veuillez renseigner votre nom et téléphone");
      return;
    }

    if (!calculatedPrice) {
      toast.error("Veuillez d'abord calculer le prix");
      return;
    }

    try {
      const suggestion = calculatedPrice.suggestion || computeFromSides(salonData);
      const quoteItem = {
        productType: "salon" as const,
        productName: `Salon Marocain Sur Mesure (${salonData.layout}-shape)`,
        layout: salonData.layout,
        sideA: salonData.sideA,
        sideB: salonData.sideB,
        sideC: salonData.layout === "U" ? salonData.sideC : undefined,
        mattressLength: salonData.mattressLength,
        mattressCount: suggestion.mattressCount,
        cornerCount: suggestion.cornerCount,
        perSide: suggestion.perSide,
        armCount: salonData.armCount,
        hasSmallTable: salonData.hasSmallTable,
        hasBigTable: salonData.hasBigTable,
        needsDelivery: salonData.needsDelivery,
        deliveryLocation: salonData.deliveryLocation,
        unitPrice: calculatedPrice.subtotal,
        quantity: 1,
        subtotal: calculatedPrice.total,
      };

      const result = await createQuote.mutateAsync({
        customerName: customerInfo.name,
        customerEmail: customerInfo.email || undefined,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address || undefined,
        notes: customerInfo.notes || undefined,
        items: [quoteItem],
      });

      toast.success("Devis envoyé avec succès !");
      setLocation(`/quote/${result.quoteId}`);
    } catch {
      toast.error("Erreur lors de l'envoi du devis");
    }
  };

  const formatPrice = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Calculateur de Devis</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container py-8 max-w-5xl">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="salon">Salon Marocain</TabsTrigger>
            <TabsTrigger value="carpet">Tapis</TabsTrigger>
            <TabsTrigger value="curtain">Rideaux</TabsTrigger>
          </TabsList>

          {/* Salon Tab */}
          <TabsContent value="salon" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration du Salon</CardTitle>
                <CardDescription>
                  Choisissez la forme (L ou U) et entrez les longueurs en mètres.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Forme</Label>
                    <Select
                      value={salonData.layout}
                      onValueChange={(v) => setSalonData({ ...salonData, layout: v as any })}
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
                      min="1"
                      max="240"
                      value={salonData.mattressLength}
                      onChange={(e) =>
                        setSalonData({ ...salonData, mattressLength: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <div>
                    <Label>Côté A (m)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={salonData.sideA}
                      onChange={(e) =>
                        setSalonData({ ...salonData, sideA: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <div>
                    <Label>Côté B (m)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={salonData.sideB}
                      onChange={(e) =>
                        setSalonData({ ...salonData, sideB: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>

                  {salonData.layout === "U" && (
                    <div>
                      <Label>Côté C (m)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={salonData.sideC}
                        onChange={(e) =>
                          setSalonData({ ...salonData, sideC: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center my-6">
          <Button size="lg" onClick={handleCalculate}>
            <Calculator className="h-5 w-5 mr-2" /> Calculer le prix
          </Button>
        </div>

        {calculatedPrice && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Résultat du Calcul</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {calculatedPrice.suggestion && (
                <div className="bg-muted/30 p-3 rounded">
                  <p className="text-sm mb-2 font-medium">Répartition automatique :</p>
                  <ul className="text-sm ml-3 list-disc">
                    <li>Longueur utilisable totale : {calculatedPrice.suggestion.availableLength} m</li>
                    <li>
                      Répartition des matelas :{" "}
                      {Object.entries(calculatedPrice.suggestion.perSide)
                        .filter(([_, v]) => v > 0)
                        .map(([k, v]) => `Côté ${k} → ${v} matelas`)
                        .join(", ")}
                    </li>
                    <li>Nombre total de matelas : {calculatedPrice.suggestion.mattressCount}</li>
                    <li>Nombre de coins : {calculatedPrice.suggestion.cornerCount}</li>
                  </ul>
                </div>
              )}
              <div className="pt-3 border-t flex justify-between">
                <span>Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(calculatedPrice.total)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
