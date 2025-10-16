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

// === Helpers ajoutés ===
// Normalise "2,5" -> 2.5 et force number
const toNum = (v: string | number) => {
  const raw = typeof v === "string" ? v.replace(/\s/g, "").replace(",", ".") : v;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

// Calcule le nombre de matelas et de coins selon la forme et les côtés (en mètres)
const computeSalonFromLayout = (
  layout: "L" | "U",
  sideA: number,
  sideB: number,
  sideC: number,
  mattressLengthCm: number
) => {
  const perimM = sideA + sideB + (layout === "U" ? sideC : 0);
  const matLenM = Math.max(mattressLengthCm / 100, 0.01); // évite division par 0
  const mattressCount = Math.max(1, Math.round(perimM / matLenM));
  const cornerCount = layout === "U" ? 2 : 1;
  return { mattressCount, cornerCount };
};

export default function QuotePage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"salon" | "carpet" | "curtain">("salon");
  
  // Salon state (nouvelle structure alignée avec l’UI Forme + Côtés)
  const [salonData, setSalonData] = useState({
    layout: "L" as "L" | "U",
    sideA: 3,      // m
    sideB: 2.5,    // m
    sideC: 0,      // m (utilisé si U)
    mattressLength: 190, // cm
    armCount: 2,
    hasSmallTable: false,
    hasBigTable: false,
    needsDelivery: false,
    deliveryLocation: "",
  });

  // Carpet state
  const [carpetData, setCarpetData] = useState({
    length: 5,
    width: 4,
    needsDelivery: false,
    deliveryLocation: "",
  });

  // Curtain state
  const [curtainData, setCurtainData] = useState({
    length: 2.5,
    width: 2,
    quality: "dubai" as "dubai" | "quality2" | "quality3",
    needsDelivery: false,
    deliveryLocation: "",
  });

  // Customer info
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

  const handleCalculate = async () => {
    try {
      if (activeTab === "salon") {
        const {
          layout, sideA, sideB, sideC,
          mattressLength, armCount, hasSmallTable, hasBigTable,
          needsDelivery, deliveryLocation
        } = salonData as any;

        const { mattressCount, cornerCount } = computeSalonFromLayout(
          layout,
          toNum(sideA),
          toNum(sideB),
          toNum(sideC),
          toNum(mattressLength)
        );

        const result = await calculateSalon.mutateAsync({
          mattressLength: Math.round(toNum(mattressLength)),
          mattressCount,
          cornerCount,
          armCount: Math.max(0, Math.floor(toNum(armCount))),
          hasSmallTable: !!hasSmallTable,
          hasBigTable: !!hasBigTable,
          needsDelivery: !!needsDelivery,
          deliveryLocation: deliveryLocation?.trim() || undefined,
        });
        setCalculatedPrice(result);
      } else if (activeTab === "carpet") {
        const result = await calculateCarpet.mutateAsync({
          ...carpetData,
          length: toNum((carpetData as any).length),
          width: toNum((carpetData as any).width),
        });
        setCalculatedPrice(result);
      } else {
        const result = await calculateCurtain.mutateAsync({
          ...curtainData,
          length: toNum((curtainData as any).length),
          width: toNum((curtainData as any).width),
        });
        setCalculatedPrice(result);
      }
      toast.success("Prix calculé avec succès !");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message ?? "Erreur lors du calcul du prix");
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
      const items: any[] = [];
      let quoteItem: any = null;

      if (activeTab === "salon") {
        const {
          layout, sideA, sideB, sideC,
          mattressLength, armCount, hasSmallTable, hasBigTable,
          needsDelivery, deliveryLocation
        } = salonData as any;

        const { mattressCount, cornerCount } = computeSalonFromLayout(
          layout, toNum(sideA), toNum(sideB), toNum(sideC), toNum(mattressLength)
        );

        quoteItem = {
          productType: "salon" as const,
          productName: "Salon Marocain Sur Mesure",
          mattressLength: Math.round(toNum(mattressLength)),
          mattressCount,
          cornerCount,
          armCount: Math.max(0, Math.floor(toNum(armCount))),
          hasSmallTable: !!hasSmallTable,
          hasBigTable: !!hasBigTable,
          needsDelivery: !!needsDelivery,
          deliveryLocation: deliveryLocation?.trim() || undefined,
          unitPrice: calculatedPrice.subtotal,
          quantity: 1,
          subtotal: calculatedPrice.total,
        };
      } else if (activeTab === "carpet") {
        quoteItem = {
          productType: "tapis" as const,
          productName: `Tapis sur mesure ${carpetData.length}m x ${carpetData.width}m`,
          length: carpetData.length,
          width: carpetData.width,
          needsDelivery: carpetData.needsDelivery,
          deliveryLocation: carpetData.deliveryLocation,
          unitPrice: calculatedPrice.subtotal,
          quantity: 1,
          subtotal: calculatedPrice.total,
        };
      } else {
        const qualityLabels = {
          dubai: "1ère qualité Dubai",
          quality2: "2ème qualité",
          quality3: "3ème qualité",
        };
        quoteItem = {
          productType: "rideau" as const,
          productName: `Rideau ${qualityLabels[curtainData.quality]} - ${curtainData.length}m x ${curtainData.width}m`,
          length: curtainData.length,
          width: curtainData.width,
          needsDelivery: curtainData.needsDelivery,
          deliveryLocation: curtainData.deliveryLocation,
          quality: curtainData.quality,
          unitPrice: calculatedPrice.subtotal,
          quantity: 1,
          subtotal: calculatedPrice.total,
        };
      }

      items.push(quoteItem);

      const payload = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email || undefined,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address || undefined,
        notes: customerInfo.notes || undefined,
        items,
      };

      const res = await createQuote.mutateAsync(payload);
      toast.success("Demande de devis envoyée !");
      setLocation(`/quotes/${res.id}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message ?? "Erreur lors de l’envoi de la demande");
    }
  };

  return (
    <div className="container max-w-5xl py-6">
      <div className="mb-6 flex items-center">
        <Link href="/">
          <Button variant="ghost" className="mr-2 px-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Calculateur de Devis</h1>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="salon">Salon Marocain</TabsTrigger>
          <TabsTrigger value="carpet">Tapis</TabsTrigger>
          <TabsTrigger value="curtain">Rideaux</TabsTrigger>
        </TabsList>

        {/* Salon Tab (Forme + Côtés) */}
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
                <div className="space-y-2">
                  <Label htmlFor="layout">Forme</Label>
                  <Select
                    value={salonData.layout}
                    onValueChange={(value) => setSalonData(s => ({ ...s, layout: value as "L" | "U" }))}
                  >
                    <SelectTrigger id="layout"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="U">U</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mattressLength">Longueur du matelas (cm)</Label>
                  <Input
                    id="mattressLength"
                    type="number"
                    min="1"
                    max="240"
                    value={salonData.mattressLength}
                    onChange={(e) => setSalonData(s => ({ ...s, mattressLength: Math.round(toNum(e.target.value)) }))}
                  />
                  <p className="text-xs text-muted-foreground">Maximum : 240 cm</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sideA">Côté A (m)</Label>
                  <Input
                    id="sideA"
                    type="text"
                    inputMode="decimal"
                    step="0.1"
                    value={salonData.sideA}
                    onChange={(e) => setSalonData(s => ({ ...s, sideA: toNum(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sideB">Côté B (m)</Label>
                  <Input
                    id="sideB"
                    type="text"
                    inputMode="decimal"
                    step="0.1"
                    value={salonData.sideB}
                    onChange={(e) => setSalonData(s => ({ ...s, sideB: toNum(e.target.value) }))}
                  />
                </div>

                {salonData.layout === "U" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="sideC">Côté C (m)</Label>
                    <Input
                      id="sideC"
                      type="text"
                      inputMode="decimal"
                      step="0.1"
                      value={salonData.sideC}
                      onChange={(e) => setSalonData(s => ({ ...s, sideC: toNum(e.target.value) }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="armCount">Nombre de bras</Label>
                  <Input
                    id="armCount"
                    type="number"
                    min="0"
                    value={salonData.armCount}
                    onChange={(e) => setSalonData(s => ({ ...s, armCount: Math.max(0, Math.floor(toNum(e.target.value))) }))}
                  />
                  <p className="text-xs text-muted-foreground">Par défaut : 2 bras</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Options</h4>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smallTable"
                    checked={salonData.hasSmallTable}
                    onCheckedChange={(checked) => setSalonData(s => ({ ...s, hasSmallTable: !!checked }))}
                  />
                  <Label htmlFor="smallTable" className="cursor-pointer">Petite table (+50 000 FCFA)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bigTable"
                    checked={salonData.hasBigTable}
                    onCheckedChange={(checked) => setSalonData(s => ({ ...s, hasBigTable: !!checked }))}
                  />
                  <Label htmlFor="bigTable" className="cursor-pointer">Grande table (+130 000 FCFA)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="salonDelivery"
                    checked={salonData.needsDelivery}
                    onCheckedChange={(checked) => setSalonData(s => ({ ...s, needsDelivery: !!checked }))}
                  />
                  <Label htmlFor="salonDelivery" className="cursor-pointer">Livraison à Bamako (+75 000 FCFA)</Label>
                </div>

                {salonData.needsDelivery && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="salonLocation">Lieu de livraison</Label>
                    <Input
                      id="salonLocation"
                      placeholder="Ex: Bamako, Quartier..."
                      value={salonData.deliveryLocation}
                      onChange={(e) => setSalonData(s => ({ ...s, deliveryLocation: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Carpet Tab */}
        <TabsContent value="carpet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dimensions du Tapis</CardTitle>
              <CardDescription>
                Le prix est calculé selon la formule : Longueur × Largeur × 13 000 FCFA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carpetLength">Longueur (mètres)</Label>
                  <Input
                    id="carpetLength"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={carpetData.length}
                    onChange={(e) => setCarpetData({ ...carpetData, length: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carpetWidth">Largeur (mètres)</Label>
                  <Input
                    id="carpetWidth"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={carpetData.width}
                    onChange={(e) => setCarpetData({ ...carpetData, width: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="carpetDelivery"
                    checked={carpetData.needsDelivery}
                    onCheckedChange={(checked) => setCarpetData({ ...carpetData, needsDelivery: checked as boolean })}
                  />
                  <Label htmlFor="carpetDelivery" className="cursor-pointer">
                    Livraison à Bamako (+75 000 FCFA)
                  </Label>
                </div>
                {carpetData.needsDelivery && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="carpetLocation">Lieu de livraison</Label>
                    <Input
                      id="carpetLocation"
                      placeholder="Ex: Bamako, Quartier..."
                      value={carpetData.deliveryLocation}
                      onChange={(e) => setCarpetData({ ...carpetData, deliveryLocation: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Curtain Tab */}
        <TabsContent value="curtain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dimensions et Qualité du Rideau</CardTitle>
              <CardDescription>
                Choisissez la qualité et les dimensions de votre rideau
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="curtainQuality">Qualité du tissu</Label>
                <Select
                  value={curtainData.quality}
                  onValueChange={(value) => setCurtainData({ ...curtainData, quality: value as "dubai" | "quality2" | "quality3" })}
                >
                  <SelectTrigger id="curtainQuality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dubai">1ère qualité Dubai - 6 000 FCFA/m²</SelectItem>
                    <SelectItem value="quality2">2ème qualité - 4 500 FCFA/m²</SelectItem>
                    <SelectItem value="quality3">3ème qualité - 4 000 FCFA/m²</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="curtainLength">Hauteur (mètres)</Label>
                  <Input
                    id="curtainLength"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={curtainData.length}
                    onChange={(e) => setCurtainData({ ...curtainData, length: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="curtainWidth">Largeur (mètres)</Label>
                  <Input
                    id="curtainWidth"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={curtainData.width}
                    onChange={(e) => setCurtainData({ ...curtainData, width: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="curtainDelivery"
                    checked={curtainData.needsDelivery}
                    onCheckedChange={(checked) => setCurtainData({ ...curtainData, needsDelivery: checked as boolean })}
                  />
                  <Label htmlFor="curtainDelivery" className="cursor-pointer">
                    Livraison à Bamako (+75 000 FCFA)
                  </Label>
                </div>
                {curtainData.needsDelivery && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="curtainLocation">Lieu de livraison</Label>
                    <Input
                      id="curtainLocation"
                      placeholder="Ex: Bamako, Quartier..."
                      value={curtainData.deliveryLocation}
                      onChange={(e) => setCurtainData({ ...curtainData, deliveryLocation: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bloc calcul / envoi */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calcul</CardTitle>
            <CardDescription>Obtenez une estimation du prix</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleCalculate} disabled={calculateSalon.isPending || calculateCarpet.isPending || calculateCurtain.isPending}>
              {calculateSalon.isPending || calculateCarpet.isPending || calculateCurtain.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  &nbsp;Calcul en cours...
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5" />
                  &nbsp;Calculer le prix
                </>
              )}
            </Button>

            {calculatedPrice && (
              <div className="border rounded-lg p-4 space-y-1 text-sm">
                <p>Sous-total : <strong>{calculatedPrice.subtotal.toLocaleString("fr-FR")} FCFA</strong></p>
                {calculatedPrice.deliveryFee ? (
                  <p>Livraison : <strong>{calculatedPrice.deliveryFee.toLocaleString("fr-FR")} FCFA</strong></p>
                ) : null}
                <p>Total : <strong>{calculatedPrice.total.toLocaleString("fr-FR")} FCFA</strong></p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Infos client + envoi */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du client</CardTitle>
            <CardDescription>Vos coordonnées pour recevoir le devis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optionnel)</Label>
                <Input id="email" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse (optionnel)</Label>
                <Input id="address" value={customerInfo.address} onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea id="notes" value={customerInfo.notes} onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })} />
            </div>

            <Button
              className="w-full"
              onClick={handleSubmitQuote}
              disabled={!calculatedPrice || createQuote.isPending}
            >
              {createQuote.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  &nbsp;Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Envoyer ma demande de devis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
