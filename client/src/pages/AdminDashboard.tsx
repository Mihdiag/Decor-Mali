import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Eye, MessageSquare, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: quotes, refetch } = trpc.quotes.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const updateStatus = trpc.quotes.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour avec succès");
      refetch();
      setDetailsOpen(false);
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du statut");
    },
  });

  const updateNotes = trpc.quotes.updateAdminNotes.useMutation({
    onSuccess: () => {
      toast.success("Notes enregistrées avec succès");
      refetch();
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement des notes");
    },
  });

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} FCFA`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "En attente", variant: "secondary" },
      validated: { label: "Validé", variant: "default" },
      rejected: { label: "Rejeté", variant: "destructive" },
      converted: { label: "Converti", variant: "outline" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleValidate = async (quoteId: string) => {
    await updateStatus.mutateAsync({ id: quoteId, status: "validated" });
  };

  const handleReject = async (quoteId: string) => {
    await updateStatus.mutateAsync({ id: quoteId, status: "rejected" });
  };

  const handleSaveNotes = async (quoteId: string) => {
    await updateNotes.mutateAsync({ id: quoteId, adminNotes });
  };

  const openDetails = (quote: any) => {
    setSelectedQuote(quote);
    setAdminNotes(quote.adminNotes || "");
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Accès réservé aux administrateurs</p>
        <Link href="/">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    );
  }

  const pendingQuotes = quotes?.filter(q => q.status === "pending") || [];
  const validatedQuotes = quotes?.filter(q => q.status === "validated") || [];
  const otherQuotes = quotes?.filter(q => q.status !== "pending" && q.status !== "validated") || [];

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
          <h1 className="text-xl font-bold">Tableau de Bord Administrateur</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Devis en attente</CardDescription>
              <CardTitle className="text-3xl">{pendingQuotes.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Devis validés</CardDescription>
              <CardTitle className="text-3xl">{validatedQuotes.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total des devis</CardDescription>
              <CardTitle className="text-3xl">{quotes?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quotes Table */}
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">En attente ({pendingQuotes.length})</TabsTrigger>
            <TabsTrigger value="validated">Validés ({validatedQuotes.length})</TabsTrigger>
            <TabsTrigger value="all">Tous ({quotes?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Devis en attente de validation</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingQuotes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Aucun devis en attente
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingQuotes.map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-mono text-xs">{quote.id.slice(0, 8)}</TableCell>
                          <TableCell>{quote.customerName}</TableCell>
                          <TableCell>{quote.customerPhone}</TableCell>
                          <TableCell className="font-semibold">{formatPrice(quote.totalAmount)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(quote.createdAt!).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openDetails(quote)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleValidate(quote.id)}
                                disabled={updateStatus.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(quote.id)}
                                disabled={updateStatus.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validated">
            <Card>
              <CardHeader>
                <CardTitle>Devis validés</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validatedQuotes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Aucun devis validé
                        </TableCell>
                      </TableRow>
                    ) : (
                      validatedQuotes.map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-mono text-xs">{quote.id.slice(0, 8)}</TableCell>
                          <TableCell>{quote.customerName}</TableCell>
                          <TableCell>{quote.customerPhone}</TableCell>
                          <TableCell className="font-semibold">{formatPrice(quote.totalAmount)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(quote.createdAt!).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => openDetails(quote)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Tous les devis</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!quotes || quotes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Aucun devis
                        </TableCell>
                      </TableRow>
                    ) : (
                      quotes.map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-mono text-xs">{quote.id.slice(0, 8)}</TableCell>
                          <TableCell>{quote.customerName}</TableCell>
                          <TableCell>{quote.customerPhone}</TableCell>
                          <TableCell className="font-semibold">{formatPrice(quote.totalAmount)}</TableCell>
                          <TableCell>{getStatusBadge(quote.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(quote.createdAt!).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => openDetails(quote)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quote Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du Devis #{selectedQuote?.id.slice(0, 8)}</DialogTitle>
            <DialogDescription>
              {getStatusBadge(selectedQuote?.status)}
            </DialogDescription>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Informations Client</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Nom :</span> {selectedQuote.customerName}</p>
                  {selectedQuote.customerEmail && (
                    <p><span className="text-muted-foreground">Email :</span> {selectedQuote.customerEmail}</p>
                  )}
                  <p><span className="text-muted-foreground">Téléphone :</span> {selectedQuote.customerPhone}</p>
                  {selectedQuote.customerAddress && (
                    <p><span className="text-muted-foreground">Adresse :</span> {selectedQuote.customerAddress}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Montant</h4>
                <p className="text-2xl font-bold text-primary">{formatPrice(selectedQuote.totalAmount)}</p>
              </div>

              {selectedQuote.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes du client</h4>
                  <p className="text-sm text-muted-foreground">{selectedQuote.notes}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Notes administrateur</h4>
                <Textarea
                  placeholder="Ajouter des notes internes..."
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
                <Button
                  className="mt-2"
                  size="sm"
                  onClick={() => handleSaveNotes(selectedQuote.id)}
                  disabled={updateNotes.isPending}
                >
                  {updateNotes.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Enregistrer les notes
                    </>
                  )}
                </Button>
              </div>

              {selectedQuote.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => handleValidate(selectedQuote.id)}
                    disabled={updateStatus.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Valider le devis
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedQuote.id)}
                    disabled={updateStatus.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter le devis
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

