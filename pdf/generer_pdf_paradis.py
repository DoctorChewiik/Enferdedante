#!/usr/bin/env python3
"""Génère docs/Paradis_de_Dante.pdf : un dossier détaillé sur le Paradis de Dante.

Les données des cieux sont lues dans js/paradis-data.js (même source que la simulation),
les illustrations dans docs/images/paradis/ (captures de la simulation).
Usage : python3 pdf/generer_pdf_paradis.py
"""
import json
import os

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import KeepTogether, PageBreak, SimpleDocTemplate, Spacer

import generer_pdf as base
from generer_pdf import P, image, tableau

SORTIE = os.path.join(base.RACINE, "docs", "Paradis_de_Dante.pdf")
base.PIED = "Le Paradis de Dante — dossier"


def lire_ciels():
    src = open(os.path.join(base.RACINE, "js", "paradis-data.js"), encoding="utf-8").read()
    return json.loads(src[src.index("["):src.rindex("]") + 1])


def construire():
    ciels = lire_ciels()
    h = []

    # ---------- Couverture ----------
    h += [Spacer(1, 3 * cm), P("Le Paradis de Dante", "titre"), Spacer(1, 6),
          P("Ascension à travers les dix cieux du <i>Paradiso</i>", "soustitre"), Spacer(1, 18),
          image("paradis/00_spheres.jpg", 16 * cm), Spacer(1, 14),
          P("« La gloria di colui che tutto move<br/>per l'universo penetra, e risplende<br/>in una parte più e meno altrove. »", "cit"),
          P("« La gloire de celui qui meut toute chose pénètre l'univers et resplendit plus en un lieu, et moins ailleurs. » — Paradis, chant I", "legende"),
          Spacer(1, 1 * cm),
          P("Dossier accompagnant la simulation 2.5D interactive (index.html, onglet Paradis)", "legende"),
          PageBreak()]

    # ---------- Sommaire ----------
    h.append(P("Sommaire", "h1"))
    sommaire = ["1. Du Purgatoire au Paradis", "2. Le cosmos de Dante : sphères et anges", "3. Lumière, musique et béatitude",
                "4. Vue d'ensemble des cieux"]
    sommaire += [f"{5 + i}. {c['numero']} — {c['nom']}" for i, c in enumerate(ciels)]
    n = 5 + len(ciels)
    sommaire += [f"{n}. La vision de Dieu", f"{n + 1}. L'Enfer et le Paradis en miroir", f"{n + 2}. Postérité du Paradiso", f"{n + 3}. Sources"]
    for s in sommaire:
        h.append(P(s))
    h.append(PageBreak())

    # ---------- 1. Du Purgatoire au Paradis ----------
    h.append(P("1. Du Purgatoire au Paradis", "h1"))
    h.append(P("Le <i>Paradis</i> est le troisième et dernier cantique de la <i>Divine Comédie</i>, composé par Dante Alighieri pendant ses dernières années d'exil, entre 1316 environ et sa mort à Ravenne en 1321. Comme l'<i>Enfer</i> et le <i>Purgatoire</i>, il compte trente-trois chants en <i>terza rima</i>, ce qui porte l'ensemble du poème à cent chants."))
    h.append(P("Après avoir gravi la montagne du Purgatoire, Dante retrouve au Paradis terrestre, à son sommet, Béatrice Portinari, la jeune Florentine qu'il a aimée et qui est morte en 1290. Virgile, païen, ne peut aller plus loin et disparaît. Purifié dans les eaux du Léthé et de l'Eunoé, Dante est désormais « pur et disposé à monter aux étoiles »."))
    h.append(P("Au début du chant I, à midi du mercredi de Pâques 1300, Dante voit Béatrice fixer le soleil comme un aigle, l'imite et se sent soudain « transhumané » : il s'élève sans s'en apercevoir, porté par la loi naturelle qui pousse chaque créature vers sa fin, comme le feu monte vers le haut. Béatrice sera son guide jusqu'à l'Empyrée ; là, saint Bernard de Clairvaux prendra le relais pour la vision finale."))
    h.append(P("Dante prévient dès le début que ce qu'il a vu dépasse la mémoire et le langage : il invente le verbe <i>trasumanar</i>, « passer au-delà de l'humain », et avertit les lecteurs dans leur « petite barque » de ne pas le suivre sur cette mer jamais parcourue s'ils ne sont pas nourris du « pain des anges »."))

    # ---------- 2. Cosmos ----------
    h.append(P("2. Le cosmos de Dante : sphères et anges", "h1"))
    h.append(P("Le Paradis repose sur l'astronomie de Ptolémée et d'Aristote, enseignée au Moyen Âge : la Terre immobile est au centre de l'univers, entourée de neuf sphères transparentes et concentriques qui tournent autour d'elle. Les sept premières portent chacune une planète (la Lune et le Soleil étant comptés comme planètes), la huitième porte les étoiles fixes, et la neuvième, le Premier Mobile, invisible et cristalline, donne le mouvement à toutes les autres. Au-delà s'étend l'Empyrée, immobile, ciel de pure lumière hors de l'espace et du temps, où demeurent Dieu, les anges et les bienheureux."))
    h.append(P("Chaque sphère est mue par l'un des neuf chœurs des anges, selon la hiérarchie du pseudo-Denys l'Aréopagite, que Béatrice expose au chant XXVIII. Les anges transmettent l'influence divine aux cieux, et les cieux à leur tour influencent les inclinations des hommes : c'est pourquoi les bienheureux apparaissent à Dante dans le ciel dont l'astre a marqué leur tempérament."))
    lignes = [["Ciel", "Âmes qui y apparaissent", "Chœur angélique moteur"]]
    for c in ciels:
        lignes.append([c["nom"], c["ames"].split(",")[0].split(":")[0], c["ange"]])
    h.append(tableau(lignes, [4.2 * cm, 7.4 * cm, 5.4 * cm]))
    h.append(Spacer(1, 6))
    h.append(P("Les trois premiers cieux (Lune, Mercure, Vénus) sont encore touchés par le cône d'ombre que projette la Terre : les vertus qui y sont honorées ont été mêlées d'une imperfection (inconstance, désir de gloire, amour d'abord terrestre). À partir du Soleil, les âmes représentent les vertus cardinales sans défaut (prudence, force, justice, tempérance), puis, dans les Étoiles fixes, les vertus théologales (foi, espérance, charité)."))

    # ---------- 3. Béatitude ----------
    h.append(P("3. Lumière, musique et béatitude", "h1"))
    h.append(P("Toutes les âmes sauvées habitent en réalité l'Empyrée, dans la Rose céleste. Si elles se montrent à Dante dans les différentes sphères, c'est par condescendance pour son intelligence humaine, qui ne comprend que par les sens : Béatrice explique au chant IV que l'Écriture elle-même attribue à Dieu « des pieds et des mains » pour se faire comprendre. Les sphères expriment donc des degrés de béatitude, non des lieux séparés."))
    h.append(P("Aucun bienheureux n'envie un degré plus élevé. Piccarda l'affirme dans le ciel de la Lune : la charité accorde parfaitement leur volonté à celle de Dieu, de sorte que « tout lieu du ciel est Paradis »."))
    h.append(P("Au Paradis, les châtiments visibles de l'Enfer laissent place à un langage de lumière, de mouvement et de musique. À partir de Mercure, les âmes se cachent dans leur propre éclat, qui grandit avec leur joie. Elles dansent en rondes, forment des figures (une croix dans Mars, des lettres puis un aigle dans Jupiter, une échelle dans Saturne) et chantent des hymnes. À chaque montée, Béatrice devient plus belle et son sourire plus éclatant, jusqu'à ce que, dans Saturne, elle doive cesser de sourire, car Dante, encore mortel, en serait foudroyé comme Sémélé."))

    # ---------- 4. Vue d'ensemble ----------
    h.append(PageBreak())
    h.append(P("4. Vue d'ensemble des cieux", "h1"))
    resumes = {
        "lune": "Visages pâles comme des reflets", "mercure": "Mille splendeurs qui accourent", "venus": "Rondes de lumières",
        "soleil": "Couronnes de douze sages", "mars": "Croix de lumières", "jupiter": "Lettres puis aigle de lumières",
        "saturne": "Échelle d'or, silence", "etoiles": "Triomphe du Christ, examen de Dante", "premier-mobile": "Point de lumière et neuf cercles d'anges",
        "empyree": "Fleuve de lumière, Rose céleste, vision de Dieu",
    }
    lignes = [["Ciel", "Âmes", "Manifestation", "Chants"]]
    for c in ciels:
        lignes.append([c["nom"], c["ames"].split(",")[0].split(":")[0], resumes[c["id"]], c["chants"]])
    h.append(tableau(lignes, [4 * cm, 5.2 * cm, 5 * cm, 2.8 * cm]))

    # ---------- Les cieux ----------
    for i, c in enumerate(ciels):
        h.append(PageBreak())
        h.append(P(f"{5 + i}. {c['numero'].upper()} · {c['chants']}", "num"))
        h.append(P(c["nom"], "h1"))
        h.append(image(f"paradis/{i + 1:02d}_{c['id']}.jpg", 15.5 * cm))
        h.append(P("Représentation 2.5D dans la simulation : les âmes, leur manifestation et Dante guidé par "
                   + ("saint Bernard." if c["id"] == "empyree" else "Béatrice."), "legende"))
        for titre, cle in [("Le lieu", "lieu"), ("Les âmes", "ames"), ("La béatitude", "beatitude"), ("Le sens", "sens"), ("L'intelligence motrice", "ange")]:
            h.append(KeepTogether([P(titre, "h2"), P(c[cle])]))
        h.append(KeepTogether([P("Âmes rencontrées", "h2"), P(" · ".join(c["personnages"]))]))
        h.append(P("Épisode marquant", "h2"))
        h.append(P(c["episode"]))

    # ---------- Vision finale ----------
    h.append(PageBreak())
    h.append(P(f"{n}. La vision de Dieu", "h1"))
    h.append(P("Le chant XXXIII s'ouvre sur la prière de saint Bernard à la Vierge, l'un des passages les plus célèbres de la littérature italienne :"))
    h.append(P("« Vergine Madre, figlia del tuo figlio,<br/>umile e alta più che creatura,<br/>termine fisso d'etterno consiglio… »", "cit"))
    h.append(P("« Vierge mère, fille de ton fils, humble et haute plus que toute créature, terme fixé d'un éternel dessein… »", "legende"))
    h.append(P("Marie accueille la prière, et Dante plonge son regard dans la lumière divine. Il y voit, réunis « en un seul volume » par l'amour, toutes les choses que l'univers disperse en feuillets : substances et accidents. Puis la lumière lui apparaît comme trois cercles de trois couleurs et d'une même dimension, le deuxième reflété par le premier « comme Iris par Iris », le troisième comme un feu soufflé également par les deux : la Trinité. Dans le deuxième cercle, il distingue une image humaine, l'Incarnation."))
    h.append(P("Comme le géomètre qui s'acharne à mesurer le cercle sans trouver le principe qui lui manque, Dante ne parvient pas à comprendre comment l'image s'accorde au cercle. Un éclair frappe alors son esprit et comble son désir. La force de l'imagination lui fait défaut, mais sa volonté et son désir tournent désormais, comme une roue mue de façon égale, avec le mouvement de Dieu :"))
    h.append(P("« l'amor che move il sole e l'altre stelle. »<br/>(« l'Amour qui meut le soleil et les autres étoiles. »)", "cit"))

    # ---------- Miroir ----------
    h.append(P(f"{n + 1}. L'Enfer et le Paradis en miroir", "h1"))
    h.append(tableau([
        ["", "Enfer", "Paradis"],
        ["Forme", "Entonnoir de neuf cercles qui descend vers le centre de la Terre", "Neuf sphères qui s'élèvent autour de la Terre, puis l'Empyrée"],
        ["Guide", "Virgile, la raison humaine", "Béatrice, la foi et la grâce ; puis saint Bernard"],
        ["Principe", "Contrapasso : la peine reflète le péché", "Degrés de béatitude : la lumière reflète la charité"],
        ["Les âmes", "Gardent leur corps d'ombre et leurs passions", "Se cachent dans leur lumière, sans envie"],
        ["Mouvement", "Plus on descend, plus on s'éloigne de Dieu et plus tout se fige (glace du Cocyte)", "Plus on monte, plus tout accélère et brille (Premier Mobile)"],
        ["Au centre", "Lucifer à trois faces, parodie de la Trinité, immobile dans la glace", "Dieu, point de lumière et trois cercles de la Trinité"],
        ["Dernier mot", "« … a riveder le stelle »", "« … e l'altre stelle »"],
    ], [2.8 * cm, 7.1 * cm, 7.1 * cm]))

    # ---------- Postérité ----------
    h.append(P(f"{n + 2}. Postérité du Paradiso", "h1"))
    h.append(P("Longtemps jugé plus difficile que l'<i>Enfer</i> en raison de ses développements théologiques, le <i>Paradis</i> est aujourd'hui admiré pour son audace poétique : rendre visible et audible ce qui échappe aux sens. Giovanni di Paolo l'illustre de miniatures au XVe siècle, Sandro Botticelli en dessine les chants avec Béatrice et Dante flottant dans des cercles presque abstraits, Gustave Doré en grave en 1868 la célèbre Rose céleste, tourbillon d'anges autour de la lumière. Les images de la rose blanche, de l'échelle de Saturne ou de l'aigle de Jupiter ont nourri la poésie, de T. S. Eliot à Borges, et le dernier vers est l'un des plus cités de la littérature européenne."))

    # ---------- Sources ----------
    h.append(P(f"{n + 3}. Sources", "h1"))
    for s in [
        "Dante Alighieri, <i>La Divine Comédie — Le Paradis</i> (chants I à XXXIII).",
        "« Paradis (Divine Comédie) », Vikidia : https://fr.vikidia.org/wiki/Paradis_(Divine_Com%C3%A9die)",
        "« Dante's Paradise (Overview) », Danteworlds, Université du Texas : https://danteworlds.laits.utexas.edu/textpopup/par0000.html",
        "« Paradiso », World of Dante, Université de Virginie : https://worldofdante.iath.virginia.edu/paradiso1.html",
        "« La Divine Comédie — Le Paradis », Critiques libres : https://www.critiqueslibres.com/livre/20743-la-divine-comedie-le-paradis-dante-alighieri",
    ]:
        h.append(P("• " + s, "source"))
    return h


if __name__ == "__main__":
    doc = SimpleDocTemplate(SORTIE, pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm, topMargin=1.9 * cm, bottomMargin=1.8 * cm,
                            title="Le Paradis de Dante", author="Simulation Enfer de Dante", subject="Les dix cieux du Paradiso")
    doc.build(construire(), onFirstPage=base.fond, onLaterPages=base.fond)
    print("PDF généré :", SORTIE)
