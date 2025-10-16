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
  
  // Salon state
  const [salonData, setSalonData] = useState({
    mattressLength: 190,
    mattressCount: 3,
    cornerCount: 2,
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
    width: 3,
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
        const result = await calculateSalon.mutateAsync(salonData);
        setCalculatedPrice(result);
      } else if (activeTab === "carpet") {
        const result = await calculateCarpet.mutateAsync(carpetData);
        setCalculatedPrice(result);
      } else {
        const result = await calculateCurtain.mutateAsync(curtainData);
        setCalculatedPrice(result);
      }
      toast.success("Prix calculé avec succès !");
    } catch (error) {
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
      let quoteItem;
      
      if (activeTab === "salon") {
        quoteItem = {
          productType: "salon" as const,
          productName: "Salon Marocain Sur Mesure",
          mattressLength: salonData.mattressLength,
          mattressCount: salonData.mattressCount,
          cornerCount: salonData.cornerCount,
          armCount: salonData.armCount,
          hasSmallTable: salonData.hasSmallTable,
          hasBigTable: salonData.hasBigTable,
          needsDelivery: salonData.needsDelivery,
          deliveryLocation: salonData.deliveryLocation,
          unitPrice: calculatedPrice.subtotal,
          quantity: 1,
          subtotal: calculatedPrice.total,
        };
      } else if (activeTab === "carpet") {
        quoteItem = {
          productType: "tapis" as const,
          productName: `Tapis ${carpetData.length}m x ${carpetData.width}m`,
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
          unitPrice: calculatedPrice.subtotal,
          quantity: 1,
          subtotal: calculatedPrice.total,
        };
      }

      const result = await createQuote.mutateAsync({
        customerName: customerInfo.name,
        customerEmail: customerInfo.email || undefined,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address || undefined,
        notes: customerInfo.notes || undefined,
        items: [quoteItem],
      });

      toast.success("Devis envoyé avec succès ! Un responsable vous contactera bientôt.");
      setLocation(`/quote/${result.quoteId}`);
    } catch (error) {
      toast.error("Erreur lors de l'envoi du devis");
    }
  };

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} FCFA`;
  };

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
          <h1 className="text-xl font-bold">Calculateur de Devis</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container py-8 max-w-5xl">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "salon" | "carpet" | "curtain")}>
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
                  Renseignez les dimensions et options de votre salon sur mesure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mattressLength">Longueur du matelas (cm)</Label>
                    <Input
                      id="mattressLength"
                      type="number"
                      min="1"
                      max="240"
                      value={salonData.mattressLength}
                      onChange={(e) => setSalonData({ ...salonData, mattressLength: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Maximum : 240cm</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mattressCount">Nombre de matelas</Label>
                    <Input
                      id="mattressCount"
                      type="number"
                      min="1"
                      value={salonData.mattressCount}
                      onChange={(e) => setSalonData({ ...salonData, mattressCount: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cornerCount">Nombre de coins</Label>
                    <Input
                      id="cornerCount"
                      type="number"
                      min="0"
                      value={salonData.cornerCount}
                      onChange={(e) => setSalonData({ ...salonData, cornerCount: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="armCount">Nombre de bras</Label>
                    <Input
                      id="armCount"
                      type="number"
                      min="0"
                      value={salonData.armCount}
                      onChange={(e) => setSalonData({ ...salonData, armCount: parseInt(e.target.value) || 0 })}
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
                      onCheckedChange={(checked) => setSalonData({ ...salonData, hasSmallTable: checked as boolean })}
                    />
                    <Label htmlFor="smallTable" className="cursor-pointer">
                      Petite table (+50 000 FCFA)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bigTable"
                      checked={salonData.hasBigTable}
                      onCheckedChange={(checked) => setSalonData({ ...salonData, hasBigTable: checked as boolean })}
                    />
                    <Label htmlFor="bigTable" className="cursor-pointer">
                      Grande table (+130 000 FCFA)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="salonDelivery"
                      checked={salonData.needsDelivery}
                      onCheckedChange={(checked) => setSalonData({ ...salonData, needsDelivery: checked as boolean })}
                    />
                    <Label htmlFor="salonDelivery" className="cursor-pointer">
                      Livraison à Bamako (+75 000 FCFA)
                    </Label>
                  </div>

                  {salonData.needsDelivery && (
                    <div className="space-y-2 pl-6">
                      <Label htmlFor="salonLocation">Lieu de livraison</Label>
                      <Input
                        id="salonLocation"
                        placeholder="Ex: Bamako, Quartier..."
                        value={salonData.deliveryLocation}
                        onChange={(e) => setSalonData({ ...salonData, deliveryLocation: e.target.value })}
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

        {/* Calculate Button */}
        <div className="flex justify-center my-6">
          <Button
            size="lg"
            onClick={handleCalculate}
            disabled={calculateSalon.isPending || calculateCarpet.isPending || calculateCurtain.isPending}
            className="gap-2"
          >
            {(calculateSalon.isPending || calculateCarpet.isPending || calculateCurtain.isPending) ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Calcul en cours...
              </>
            ) : (
              <>
                <Calculator className="h-5 w-5" />
                Calculer le prix
              </>
            )}
          </Button>
        </div>

        {/* Price Result */}
        {calculatedPrice && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Résultat du Calcul</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {calculatedPrice.breakdown && Object.entries(calculatedPrice.breakdown).map(([key, value]: [string, any]) => {
                  const labels: Record<string, string> = {
                    mattresses: "Matelas",
                    corners: "Coins",
                    arms: "Bras",
                    smallTable: "Petite table",
                    bigTable: "Grande table",
                    transport: "Transport",
                    profit: "Bénéfice",
                    carpet: "Tapis",
                  };
                  return (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{labels[key] || key}</span>
                      <span className="font-medium">{formatPrice(value)}</span>
                    </div>
                  );
                })}
                {calculatedPrice.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="font-medium">{formatPrice(calculatedPrice.deliveryFee)}</span>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(calculatedPrice.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Information */}
        {calculatedPrice && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Vos Informations</CardTitle>
              <CardDescription>
                Renseignez vos coordonnées pour recevoir votre devis. Un responsable vous contactera pour validation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    placeholder="Votre nom"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+223 XX XX XX XX"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse (optionnel)</Label>
                  <Input
                    id="address"
                    placeholder="Votre adresse"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes ou demandes spéciales (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Précisez vos besoins ou questions..."
                  rows={4}
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                />
              </div>

              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleSubmitQuote}
                disabled={createQuote.isPending}
              >
                {createQuote.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Envoi en cours...
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
        )}
      </div>
    </div>
  );
}

