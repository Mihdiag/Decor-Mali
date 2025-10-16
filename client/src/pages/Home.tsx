import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { Link } from "wouter";
import { Sofa, Ruler, Package, Phone, MapPin, Facebook, Instagram } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sofa className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">{APP_TITLE}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/">
              <a className="text-sm font-medium hover:text-primary transition-colors">Accueil</a>
            </Link>
            <Link href="/catalog">
              <a className="text-sm font-medium hover:text-primary transition-colors">Catalogue</a>
            </Link>
            <Link href="/quote">
              <a className="text-sm font-medium hover:text-primary transition-colors">Devis</a>
            </Link>
            <Link href="/contact">
              <a className="text-sm font-medium hover:text-primary transition-colors">Contact</a>
            </Link>
          </nav>
          <Link href="/quote">
            <Button>Demander un devis</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary/30 via-background to-accent/20 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-64 h-64 border-4 border-primary rounded-full" />
          <div className="absolute bottom-10 left-10 w-48 h-48 border-4 border-accent rounded-full" />
        </div>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Équipements de Maison de Qualité
            </h1>
            <p className="text-xl text-muted-foreground">
              Salons marocains, mauritaniens, tapis, rideaux et moquettes sur mesure à Bamako
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/catalog">
                <Button size="lg" className="gap-2">
                  <Package className="h-5 w-5" />
                  Voir le catalogue
                </Button>
              </Link>
              <Link href="/quote">
                <Button size="lg" variant="outline" className="gap-2">
                  <Ruler className="h-5 w-5" />
                  Calculer un devis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Sofa className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Salons sur Mesure</CardTitle>
                <CardDescription>
                  Salons marocains et mauritaniens fabriqués selon vos dimensions et préférences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Choix de tissus variés</li>
                  <li>• Épaisseurs personnalisables</li>
                  <li>• Tables assorties disponibles</li>
                  <li>• Livraison et installation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Ruler className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Tapis & Moquettes</CardTitle>
                <CardDescription>
                  Large sélection de tapis et moquettes pour tous les espaces
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Dimensions personnalisées</li>
                  <li>• Qualité premium</li>
                  <li>• Prix compétitifs</li>
                  <li>• Livraison rapide</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Package className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Devis Instantané</CardTitle>
                <CardDescription>
                  Calculez votre devis en ligne en quelques clics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Calcul automatique</li>
                  <li>• Validation par expert</li>
                  <li>• Visite sur place incluse</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Contactez-nous</h2>
            <p className="text-muted-foreground">
              Notre équipe est à votre disposition pour répondre à toutes vos questions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-medium">+223 XX XX XX XX</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">Bamako, Mali</span>
              </div>
            </div>
            <div className="flex gap-4 justify-center pt-4">
              <Button variant="outline" size="icon">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 {APP_TITLE}. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
