# Reolink App Card

[English](README.md) · [Deutsch](README.de.md) · **Français**

Une carte Lovelace pour Home Assistant qui ressemble à l’app officielle Reolink : direct, commandes, réglages et lecture des enregistrements de la carte SD dans une seule carte. Conçue pour les caméras Reolink sur batterie (p. ex. la série Argus) reliées à un Reolink Hub, elle fonctionne avec toutes les caméras de l’[intégration Reolink](https://www.home-assistant.io/integrations/reolink/) officielle.

<p>
  <img src="https://raw.githubusercontent.com/niondevelop/reolink-app-card/main/images/live.png" width="260" alt="Direct">
  <img src="https://raw.githubusercontent.com/niondevelop/reolink-app-card/main/images/playback.png" width="260" alt="Lecture">
  <img src="https://raw.githubusercontent.com/niondevelop/reolink-app-card/main/images/settings.png" width="260" alt="Réglages">
</p>

## Fonctions

- **Vrai direct** qui démarre quand la carte est visible et se met en pause après 5 minutes (réglable) ou dès que vous quittez la vue.
- **Aperçu économe :** en pause, la carte affiche la dernière image au lieu d’interroger sans cesse la caméra sur batterie.
- **Barre de commandes comme dans l’app Reolink :** parler (ouvre l’app Reolink), sirène, projecteur, enregistrement, capture et qualité (fluide, équilibrée, nette).
- **Sélecteur de mode :** mode scène du hub (désarmé / maison / absent) ou votre propre mode (`mode_entity`), plus l’occupation de la carte SD.
- **Bascule automatique** vers la caméra qui détecte une personne, un véhicule ou un animal.
- **Vue en grille** de toutes les caméras, **zoom numérique**, **réglages groupés**, **lecture** avec chronologie de 24 heures et filtres.
- **Alertes batterie** et **éditeur visuel** qui détecte les caméras automatiquement.
- **Anglais, allemand et français,** selon la langue de Home Assistant (option `language: fr` pour forcer le français).

## Installation

[![Ouvrir dans le Marketplace](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=niondevelop&repository=reolink-app-card&category=plugin)

1. Ouvrir **Paramètres → Marketplace** (à partir de Home Assistant 2026.11 ; avant, dans **HACS**)
2. Rechercher « Reolink App Card » et **Télécharger**
3. Recharger le navigateur

Si la carte n’apparaît pas encore dans la recherche, ajoutez-la vous-même : dans le Marketplace, en haut à droite, choisir **Ajouter depuis un lien** (*Add from link*), saisir `niondevelop/reolink-app-card` puis **Ajouter** (la première fois, le Marketplace demande de connecter GitHub). Avec HACS sur les versions plus anciennes : menu en haut à droite → **Dépôts personnalisés**, type **Dashboard**.

## Configuration

```yaml
type: custom:reolink-app-card
language: fr
cameras:
  - name: Entrée
    prefix: entree
```

Toutes les options sont décrites dans la [documentation en anglais](README.md#card-options) ; les noms des options sont identiques.

## Licence

MIT
