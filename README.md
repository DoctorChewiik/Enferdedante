# L'Enfer de Dante — simulation 2.5D

Simulation jouable dans le navigateur des neuf cercles de l'*Inferno* de Dante, en rendu isométrique 2.5D, avec un dossier PDF détaillé.

![Vue d'ensemble](docs/images/00_entonnoir.jpg)

## Jouer

Ouvrez `index.html` dans un navigateur (aucune installation, aucun serveur nécessaire).

- **Vue d'ensemble** : l'entonnoir de l'Enfer ; cliquez sur un anneau ou appuyez sur Entrée pour descendre.
- **Dans un cercle** : déplacez Dante avec les flèches, ZQSD/WASD ou un clic sur le sol ; Virgile vous suit.
  Approchez une âme ou un gardien pour la rencontrer (compteur « Âmes rencontrées » en haut à gauche) ; survolez-les pour lire leur histoire.
- Entrée / N : cercle suivant · P : précédent · 0 à 9 : aller à un cercle · Échap : vue d'ensemble · molette : zoom · glisser : déplacer la vue.

Chaque cercle représente son lieu, ses âmes, leur châtiment (contrapasso) et son gardien : Charon, Minos, Cerbère, Plutus, Phlégyas, les Furies, le Minotaure et les Centaures, Géryon et les Malebranche, les Géants et Lucifer.

## Le dossier PDF

[`docs/Enfer_de_Dante.pdf`](docs/Enfer_de_Dante.pdf) (27 pages) : Dante et la Divine Comédie, géographie et ordre moral de l'Enfer, contrapasso, chaque cercle illustré et détaillé, gardiens, sortie, postérité, sources.

Pour le régénérer (après modification de `js/data.js` ou des captures dans `docs/images/`) :

```
pip install reportlab
python3 pdf/generer_pdf.py
```

## Structure

| Fichier | Rôle |
|---|---|
| `js/data.js` | Textes des cercles (partagés avec le PDF) |
| `js/iso.js` | Moteur isométrique : cases, particules, personnages, déplacement du joueur |
| `js/scenes.js` | Les dix scènes (vestibule + neuf cercles) et leurs créatures |
| `js/main.js` | Interface : entonnoir, navigation, panneau, rencontres |
