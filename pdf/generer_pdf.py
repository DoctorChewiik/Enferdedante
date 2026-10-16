#!/usr/bin/env python3
"""Génère docs/Enfer_de_Dante.pdf : un dossier détaillé sur l'Enfer de Dante.

Les données des cercles sont lues dans js/data.js (même source que la simulation),
les illustrations dans docs/images/ (captures de la simulation).
Usage : python3 pdf/generer_pdf.py
"""
import json
import os
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate,
                                Spacer, Table, TableStyle)

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(RACINE, "docs", "images")
SORTIE = os.path.join(RACINE, "docs", "Enfer_de_Dante.pdf")

# ---------- Polices (avec repli sur les polices standard) ----------
POLICES = {
    "Serif": "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
    "Serif-Bold": "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
    "Serif-Italic": "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf",
}
try:
    for nom, chemin in POLICES.items():
        pdfmetrics.registerFont(TTFont(nom, chemin))
    pdfmetrics.registerFontFamily("Serif", normal="Serif", bold="Serif-Bold", italic="Serif-Italic", boldItalic="Serif-Bold")
    F, FB, FI = "Serif", "Serif-Bold", "Serif-Italic"
except Exception:
    F, FB, FI = "Times-Roman", "Times-Bold", "Times-Italic"

ENCRE = colors.HexColor("#2a1a12")
SANG = colors.HexColor("#8a1f18")
OR = colors.HexColor("#9a6b1f")
PARCHEMIN = colors.HexColor("#f6efdf")

st = {
    "titre": ParagraphStyle("titre", fontName=FB, fontSize=34, leading=40, alignment=TA_CENTER, textColor=SANG),
    "soustitre": ParagraphStyle("soustitre", fontName=FI, fontSize=15, leading=20, alignment=TA_CENTER, textColor=ENCRE),
    "h1": ParagraphStyle("h1", keepWithNext=1, fontName=FB, fontSize=21, leading=26, textColor=SANG, spaceBefore=6, spaceAfter=8),
    "h2": ParagraphStyle("h2", keepWithNext=1, fontName=FB, fontSize=13.5, leading=17, textColor=OR, spaceBefore=10, spaceAfter=3),
    "num": ParagraphStyle("num", fontName=FB, fontSize=10, leading=12, textColor=OR),
    "corps": ParagraphStyle("corps", fontName=F, fontSize=11, leading=15.2, alignment=TA_JUSTIFY, textColor=ENCRE, spaceAfter=5),
    "cit": ParagraphStyle("cit", fontName=FI, fontSize=11.5, leading=15.5, alignment=TA_CENTER, textColor=ENCRE, spaceBefore=4, spaceAfter=8, leftIndent=30, rightIndent=30),
    "legende": ParagraphStyle("legende", fontName=FI, fontSize=9, leading=11, alignment=TA_CENTER, textColor=colors.HexColor("#6a5a4a"), spaceAfter=6),
    "source": ParagraphStyle("source", fontName=F, fontSize=10, leading=13.5, textColor=ENCRE, spaceAfter=4),
    "cell": ParagraphStyle("cell", fontName=F, fontSize=9.5, leading=12, textColor=ENCRE),
    "cellb": ParagraphStyle("cellb", fontName=FB, fontSize=9.5, leading=12, textColor=ENCRE),
}


def P(texte, style="corps"):
    return Paragraph(texte, st[style])


def lire_cercles():
    src = open(os.path.join(RACINE, "js", "data.js"), encoding="utf-8").read()
    return json.loads(src[src.index("["):src.rindex("]") + 1])


def image(nom, largeur=17 * cm):
    chemin = os.path.join(IMAGES, nom)
    if not os.path.exists(chemin):
        return Spacer(1, 0)
    img = Image(chemin)
    ratio = img.imageHeight / img.imageWidth
    img.drawWidth, img.drawHeight = largeur, largeur * ratio
    return img


def fond(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setFillColor(PARCHEMIN)
    canvas.rect(0, 0, w, h, fill=1, stroke=0)
    canvas.setStrokeColor(colors.HexColor("#c9b48a"))
    canvas.setLineWidth(0.8)
    canvas.rect(1.2 * cm, 1.2 * cm, w - 2.4 * cm, h - 2.4 * cm, fill=0, stroke=1)
    if doc.page > 1:
        canvas.setFont(FI, 8.5)
        canvas.setFillColor(colors.HexColor("#7a6a5a"))
        canvas.drawString(1.8 * cm, 0.75 * cm, "L'Enfer de Dante — dossier")
        canvas.drawRightString(w - 1.8 * cm, 0.75 * cm, str(doc.page))
    canvas.restoreState()


def tableau(lignes, largeurs):
    data = [[P(c, "cellb" if i == 0 else "cell") for c in l] for i, l in enumerate(lignes)]
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e6d6b4")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#b8a07a")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#fbf6ea"), colors.HexColor("#f1e8d4")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def construire():
    cercles = lire_cercles()
    h = []

    # ---------- Couverture ----------
    h += [Spacer(1, 3 * cm), P("L'Enfer de Dante", "titre"), Spacer(1, 6),
          P("Voyage à travers les neuf cercles de l'<i>Inferno</i>", "soustitre"), Spacer(1, 18),
          image("00_entonnoir.jpg", 16 * cm), Spacer(1, 14),
          P("« Per me si va ne la città dolente,<br/>per me si va ne l'etterno dolore,<br/>per me si va tra la perduta gente. »", "cit"),
          P("« Par moi l'on va dans la cité dolente, par moi l'on va dans l'éternelle douleur, par moi l'on va parmi la gent perdue. » — Inscription de la porte de l'Enfer, chant III", "legende"),
          Spacer(1, 1 * cm),
          P("Dossier accompagnant la simulation 2.5D interactive (index.html)", "legende"),
          PageBreak()]

    # ---------- Sommaire ----------
    h.append(P("Sommaire", "h1"))
    sommaire = ["1. Dante Alighieri et la Divine Comédie", "2. La géographie de l'Enfer", "3. L'ordre moral : pourquoi ces neuf cercles ?",
                "4. Le contrapasso, loi des châtiments", "5. Vue d'ensemble des cercles"]
    sommaire += [f"{6 + i}. {c['numero']} — {c['nom']}" for i, c in enumerate(cercles)]
    sommaire += [f"{6 + len(cercles)}. Fleuves, gardiens et monstres", f"{7 + len(cercles)}. La sortie de l'Enfer",
                 f"{8 + len(cercles)}. Postérité de l'Inferno", f"{9 + len(cercles)}. Sources"]
    for s in sommaire:
        h.append(P(s))
    h.append(PageBreak())

    # ---------- 1. Dante ----------
    h.append(P("1. Dante Alighieri et la Divine Comédie", "h1"))
    h.append(P("Dante Alighieri naît à Florence en 1265 dans une famille de petite noblesse guelfe. Poète du <i>dolce stil novo</i>, il célèbre dans la <i>Vita nova</i> son amour idéalisé pour Béatrice Portinari, morte en 1290. Engagé dans la vie politique florentine, il devient prieur en 1300, au moment où la ville est déchirée entre Guelfes blancs et Guelfes noirs. En 1302, alors qu'il est en ambassade à Rome, les Noirs prennent le pouvoir : Dante est condamné à l'exil et ne reverra jamais Florence. Il meurt à Ravenne en 1321."))
    h.append(P("C'est en exil qu'il compose la <i>Commedia</i>, que Boccace qualifiera de « divine ». Le poème est écrit en italien vulgaire (le toscan) et non en latin, ce qui en fait l'un des textes fondateurs de la langue italienne. Il compte <b>trois cantiques</b> — l'<i>Enfer</i>, le <i>Purgatoire</i> et le <i>Paradis</i> — et <b>cent chants</b> : un chant d'introduction puis trente-trois chants par cantique. Il est composé en <i>terza rima</i>, des tercets d'hendécasyllabes enchaînés (ABA BCB CDC…). Le chiffre trois, symbole de la Trinité, structure toute l'œuvre."))
    h.append(P("Le voyage se déroule au printemps de l'an 1300, année du premier Jubilé. Dans la nuit du Jeudi au Vendredi saint, Dante, âgé de trente-cinq ans, se perd dans une forêt obscure, image du péché :"))
    h.append(P("« Nel mezzo del cammin di nostra vita<br/>mi ritrovai per una selva oscura,<br/>ché la diritta via era smarrita. »", "cit"))
    h.append(P("Trois fauves — une panthère (la luxure), un lion (l'orgueil) et une louve (la cupidité) — l'empêchent de gravir la colline du salut. Apparaît alors l'ombre du poète latin <b>Virgile</b>, auteur de l'<i>Énéide</i>, envoyé par Béatrice depuis le Paradis. Virgile, qui incarne la raison humaine, le guidera à travers l'Enfer et le Purgatoire ; Béatrice, figure de la foi et de la grâce, le conduira au Paradis. Le voyage dans l'Enfer dure environ vingt-quatre heures."))

    # ---------- 2. Géographie ----------
    h.append(P("2. La géographie de l'Enfer", "h1"))
    h.append(P("Pour Dante, l'Enfer est un immense gouffre en forme d'<b>entonnoir</b> (ou de cône renversé) creusé sous l'hémisphère nord, dont l'axe passe sous Jérusalem. Il s'est formé lorsque Lucifer, précipité du ciel après sa révolte, est tombé sur la Terre : épouvantée, la terre s'est retirée devant lui, creusant l'abîme et rejaillissant aux antipodes pour former la montagne du Purgatoire."))
    h.append(P("L'entonnoir est divisé en une antichambre (le vestibule) puis <b>neuf cercles</b> concentriques, de plus en plus étroits à mesure que l'on descend. Plus un cercle est profond, plus le péché qui y est puni est grave et plus la souffrance est terrible. Au fond, au centre exact de la Terre et de l'univers matériel, Lucifer est pris dans la glace du lac Cocyte. Les deux poètes descendent toujours vers la gauche — la direction du mal — et traversent les cercles grâce à des passeurs, des monstres ou des éboulements."))
    h.append(P("Quatre fleuves infernaux, empruntés à la mythologie antique, jalonnent la descente : l'<b>Achéron</b>, qui marque l'entrée ; le <b>Styx</b>, marais du cinquième cercle ; le <b>Phlégéthon</b>, fleuve de sang bouillant du septième ; et le <b>Cocyte</b>, lac gelé du neuvième. Ils ne forment qu'un seul cours d'eau, né des larmes du Vieillard de Crète, statue symbolisant l'histoire de l'humanité déchue (chant XIV)."))
    h.append(P("Entre le cinquième et le sixième cercle se dressent les murailles de fer rougeoyantes de la <b>cité de Dité</b> (Dis), nom latin de Pluton. Elles séparent le haut Enfer, où sont punis les péchés de faiblesse, du bas Enfer, où sont punis les péchés de malice."))

    # ---------- 3. Ordre moral ----------
    h.append(P("3. L'ordre moral : pourquoi ces neuf cercles ?", "h1"))
    h.append(P("Au chant XI, Virgile explique à Dante la logique de l'Enfer en s'appuyant sur l'<i>Éthique à Nicomaque</i> d'Aristote et sur la théologie de saint Thomas d'Aquin. Il distingue trois dispositions que le ciel réprouve :"))
    h.append(tableau([
        ["Catégorie", "Nature de la faute", "Cercles"],
        ["Incontinence", "Manque de maîtrise des désirs naturels, en eux-mêmes bons (amour, nourriture, biens, juste colère). C'est la faute la moins grave.", "II à V : luxure, gourmandise, avarice et prodigalité, colère et acédie"],
        ["Violence (bestialité)", "Usage de la force pour nuire, contre autrui, contre soi-même ou contre Dieu.", "VII : trois girons"],
        ["Fraude (malice)", "Usage de l'intelligence, propre à l'homme, pour tromper. C'est la faute la plus odieuse à Dieu.", "VIII (fraude simple) et IX (trahison)"],
    ], [3.4 * cm, 8.2 * cm, 5.4 * cm]))
    h.append(Spacer(1, 6))
    h.append(P("Deux zones échappent à ce schéma aristotélicien : le <b>vestibule</b> des tièdes, trop méprisables pour être admis en Enfer, et les <b>Limbes</b> (cercle I), où ceux qui n'ont pas commis de péché sont exclus du salut faute de baptême. Le <b>sixième cercle</b>, celui des hérétiques, punit une faute de l'intelligence contre la foi : l'erreur volontaire sur la vérité divine."))

    # ---------- 4. Contrapasso ----------
    h.append(P("4. Le contrapasso, loi des châtiments", "h1"))
    h.append(P("Le mot <i>contrapasso</i> apparaît au chant XXVIII, dans la bouche de Bertran de Born, qui porte sa propre tête à la main : « Così s'osserva in me lo contrapasso » (« Ainsi s'observe en moi le contrapasso »). Il désigne la correspondance entre la faute et la peine, héritée de la loi du talion."))
    h.append(P("Le contrapasso fonctionne de deux manières : <b>par analogie</b>, la peine prolonge le péché (les luxurieux emportés par la passion le sont par la tempête) ; <b>par contraste</b>, la peine est l'inverse du péché (les tièdes, qui n'ont suivi aucune cause, courent sans fin derrière une bannière ; les devins, qui prétendaient voir l'avenir, ont la tête retournée vers le dos). Les damnés ne sont pas punis par un Dieu arbitraire : ils subissent pour l'éternité ce qu'ils ont choisi d'être. Les âmes conservent leur mémoire, leur caractère et leurs passions, et peuvent voir l'avenir mais non le présent."))

    # ---------- 5. Vue d'ensemble ----------
    h.append(PageBreak())
    h.append(P("5. Vue d'ensemble des cercles", "h1"))
    lignes = [["Cercle", "Péché", "Châtiment (résumé)", "Gardien"]]
    resumes = {
        "vestibule": "Courir derrière une bannière, piqués par des guêpes", "limbes": "Désir sans espérance de voir Dieu",
        "luxure": "Emportés par une tempête éternelle", "gourmandise": "Couchés dans la boue sous une pluie glacée",
        "avarice": "Rouler d'énormes poids et s'entrechoquer", "colere": "Se battre dans le Styx / étouffer sous la vase",
        "heresie": "Enfermés dans des tombeaux enflammés", "violence": "Fleuve de sang, forêt des suicidés, désert de feu",
        "fraude": "Dix fosses aux peines variées", "trahison": "Pris dans la glace du Cocyte",
    }
    for c in cercles:
        lignes.append([c["numero"], c["nom"], resumes[c["id"]], c["gardien"].split(",")[0].split("(")[0].strip()])
    h.append(tableau(lignes, [2.4 * cm, 4.2 * cm, 6.2 * cm, 4.2 * cm]))

    # ---------- Les cercles ----------
    noms_img = ["01_vestibule.jpg", "02_limbes.jpg", "03_luxure.jpg", "04_gourmandise.jpg", "05_avarice.jpg", "06_colere.jpg",
                "07_heresie.jpg", "08_violence.jpg", "09_fraude.jpg", "10_trahison.jpg"]
    for i, c in enumerate(cercles):
        h.append(PageBreak())
        h.append(P(f"{6 + i}. {c['numero'].upper()} · {c['chants']}", "num"))
        h.append(P(c["nom"], "h1"))
        h.append(image(noms_img[i], 15.5 * cm))
        h.append(P(f"Représentation 2.5D du {c['numero'].lower() if c['id'] != 'vestibule' else 'vestibule'} dans la simulation : âmes, gardiens et châtiment.", "legende"))
        for titre, cle in [("Le lieu", "lieu"), ("Le péché", "peche"), ("Le châtiment", "chatiment"), ("Le contrapasso", "contrapasso"), ("Le gardien", "gardien")]:
            h.append(KeepTogether([P(titre, "h2"), P(c[cle])]))
        if c.get("subdivisions"):
            h.append(P("Subdivisions", "h2"))
            sub = [["Zone", "Damnés", "Châtiment"]] + [[s["nom"], s["peche"], s["chatiment"]] for s in c["subdivisions"]]
            h.append(tableau(sub, [4.6 * cm, 4.4 * cm, 8 * cm]))
        h.append(KeepTogether([P("Âmes rencontrées", "h2"), P(" · ".join(c["personnages"]))]))
        extra = TEXTES_SUPPLEMENTAIRES.get(c["id"])
        if extra:
            h.append(P("Épisode marquant", "h2"))
            for para in extra:
                h.append(P(para))

    # ---------- Fleuves et gardiens ----------
    n = 6 + len(cercles)
    h.append(PageBreak())
    h.append(P(f"{n}. Fleuves, gardiens et monstres", "h1"))
    h.append(P("Dante peuple son Enfer de figures de la mythologie gréco-romaine, transformées en démons au service de la justice divine. Elles rappellent que, pour l'homme médiéval, l'Antiquité païenne fait partie de l'histoire du salut."))
    h.append(tableau([
        ["Figure", "Lieu", "Rôle"],
        ["Charon", "Achéron", "Nocher qui fait passer les âmes ; il refuse d'abord Dante, vivant."],
        ["Minos", "Entrée du cercle II", "Juge qui assigne chaque âme à son cercle en enroulant sa queue."],
        ["Cerbère", "Cercle III", "Chien à trois têtes ; Virgile l'apaise en lui jetant de la terre dans les gueules."],
        ["Plutus", "Cercle IV", "Dieu de la richesse, réduit au silence par Virgile."],
        ["Phlégyas", "Styx (cercle V)", "Passeur qui conduit les poètes jusqu'à Dité."],
        ["Furies et Méduse", "Murailles de Dité", "Elles menacent de pétrifier Dante ; un messager céleste ouvre la porte."],
        ["Minotaure", "Entrée du cercle VII", "Gardien de l'éboulement, symbole de la violence bestiale."],
        ["Centaures", "Phlégéthon", "Chiron, Nessus et Pholus surveillent les violents ; Nessus porte Dante à gué."],
        ["Harpies", "Forêt des suicidés", "Oiseaux à visage de femme qui dévorent les arbres-damnés."],
        ["Géryon", "Entre les cercles VII et VIII", "Image de la fraude, il descend les poètes en volant en spirale."],
        ["Malebranche", "5e fosse du cercle VIII", "Démons armés de crocs, menés par Malacoda ; ils tentent de tromper les poètes."],
        ["Géants", "Puits du cercle IX", "Nemrod, Éphialte, Briarée, Antée : Antée dépose les poètes sur le Cocyte."],
        ["Lucifer", "Centre de la Terre", "Ange déchu à trois faces, parodie de la Trinité, qui broie les trois grands traîtres."],
    ], [3.4 * cm, 4.2 * cm, 9.4 * cm]))
    h.append(Spacer(1, 6))
    h.append(P("Les trois visages de Lucifer sont généralement interprétés comme l'inverse des attributs de la Trinité : à la Puissance, à la Sagesse et à l'Amour s'opposent l'impuissance, l'ignorance et la haine. Dans ses trois gueules, il broie <b>Judas</b>, traître au Christ, la tête dedans et les jambes dehors, ainsi que <b>Brutus</b> et <b>Cassius</b>, assassins de César, fondateur de l'Empire : l'Église et l'Empire, les deux autorités voulues par Dieu selon Dante, sont ainsi vengées."))

    # ---------- Sortie ----------
    h.append(P(f"{n + 1}. La sortie de l'Enfer", "h1"))
    h.append(P("Pour quitter l'Enfer, Dante s'agrippe au cou de Virgile, qui descend le long des flancs velus de Lucifer. Au passage du centre de la Terre, Virgile se retourne péniblement : ils remontent désormais vers l'hémisphère austral, et les jambes de Lucifer pointent vers le haut. Par un étroit passage creusé par un ruisseau, la « natural burella », les deux poètes rejoignent la surface au pied de la montagne du Purgatoire, au matin du dimanche de Pâques."))
    h.append(P("« E quindi uscimmo a riveder le stelle. »<br/>(« Et de là nous sortîmes revoir les étoiles. »)", "cit"))
    h.append(P("Chacun des trois cantiques se termine sur le mot <i>stelle</i>, « étoiles » : le voyage tout entier est une ascension vers la lumière."))

    # ---------- Postérité ----------
    h.append(P(f"{n + 2}. Postérité de l'Inferno", "h1"))
    h.append(P("L'<i>Enfer</i> est la partie la plus lue et la plus illustrée de la <i>Divine Comédie</i>. Sandro Botticelli en dessine la carte à la fin du XVe siècle (<i>La Carte de l'Enfer</i>) ; Gustave Doré en grave les scènes en 1861 et fixe pour longtemps l'imaginaire visuel des cercles ; Auguste Rodin conçoit <i>La Porte de l'Enfer</i>, dont est issu <i>Le Penseur</i>, à l'origine une image de Dante méditant sur son poème. Franz Liszt compose une <i>Dante-Symphonie</i>, Tchaïkovski un poème symphonique sur Francesca da Rimini. L'expression « cercles de l'Enfer » est passée dans la langue courante, et l'œuvre continue d'inspirer romans, films, bandes dessinées et jeux vidéo."))

    # ---------- Sources ----------
    h.append(P(f"{n + 3}. Sources", "h1"))
    for s in [
        "Dante Alighieri, <i>La Divine Comédie — L'Enfer</i> (chants I à XXXIV). Traduction française en ligne : Rivarol (Wikisource).",
        "« L'Enfer (trad. Rivarol) », Wikisource : https://fr.wikisource.org/wiki/L%E2%80%99Enfer_(trad._Rivarol)",
        "« Enfer (Divine Comédie) », Vikidia : https://fr.vikidia.org/wiki/Enfer_(Divine_Com%C3%A9die)",
        "« I cerchi dell'Inferno di Dante : riassunto », Studenti.it : https://www.studenti.it/i-cerchi-dell-inferno-di-dante-riassunto.html",
        "« Contrappasso — Divina Commedia », Algor Education : https://cards.algoreducation.com/it/content/DeN8va2x/contrappasso-divina-commedia",
    ]:
        h.append(P("• " + s, "source"))
    return h


TEXTES_SUPPLEMENTAIRES = {
    "vestibule": ["Dante entend des soupirs, des plaintes et des cris en mille langues qui tourbillonnent dans l'air sans étoiles. Virgile résume le mépris réservé aux tièdes : « Ne parlons pas d'eux, mais regarde et passe. » Au bord de l'Achéron, Charon refuse d'embarquer un vivant ; Virgile lui impose silence : « On le veut ainsi là où l'on peut ce que l'on veut. » Un tremblement de terre et un éclair rouge font alors perdre connaissance à Dante, qui se réveille de l'autre côté du fleuve."],
    "limbes": ["Quatre grands poètes viennent à la rencontre de Virgile : Homère, Horace, Ovide et Lucain, qui accueillent Dante comme « sixième parmi tant de sagesse ». Dans le noble château, Dante voit les héros de Troie et de Rome (Hector, Énée, César) et les sages de l'Antiquité réunis autour d'Aristote. L'épisode traduit l'admiration de Dante pour la culture antique, mais aussi la limite de la raison sans la foi."],
    "luxure": ["Dante demande à parler à deux ombres qui volent ensemble : Francesca da Rimini et son beau-frère Paolo Malatesta. Francesca raconte comment, lisant ensemble le roman de Lancelot, ils échangèrent un baiser — « ce jour-là nous ne lûmes pas plus avant » — avant d'être surpris et tués par Gianciotto, le mari de Francesca. Bouleversé de pitié, Dante s'évanouit « comme tombe un corps mort »."],
    "gourmandise": ["Ciacco, un Florentin, prophétise à Dante les violences entre les factions de Florence et l'exil des Blancs. Virgile explique qu'après le Jugement dernier, les damnés retrouveront leur corps et que leur souffrance en deviendra plus parfaite, donc plus grande."],
    "avarice": ["Dante ne reconnaît aucun damné : « la vie sans discernement qui les rendit sales les rend aujourd'hui obscurs à toute connaissance. » Virgile en profite pour décrire la Fortune, intelligence céleste qui distribue les biens de ce monde selon un ordre que les hommes ne peuvent comprendre."],
    "colere": ["Pendant la traversée du Styx, Filippo Argenti, Florentin orgueilleux et violent, s'agrippe à la barque ; Virgile le repousse et les autres damnés se jettent sur lui. Arrivés devant Dité, les poètes se voient refuser l'entrée par les démons : il faudra l'intervention d'un messager du ciel, qui ouvre la porte d'un coup de baguette."],
    "heresie": ["Farinata degli Uberti, chef gibelin, se dresse dans son tombeau et dialogue fièrement avec Dante, dont la famille était guelfe. Il lui prédit son exil. Cavalcante dei Cavalcanti l'interrompt pour demander des nouvelles de son fils Guido, ami de Dante ; croyant à tort qu'il est mort, il retombe dans son tombeau. Farinata explique que les damnés voient l'avenir lointain mais ignorent le présent."],
    "violence": ["Dans la forêt des suicidés, Dante brise un rameau d'un grand buisson qui saigne et lui parle : c'est Pier della Vigna, ministre de l'empereur Frédéric II, tombé en disgrâce à cause de l'envie des courtisans et qui se donna la mort. Sur le sable brûlant, Dante retrouve avec émotion son maître Brunetto Latini, qui lui apprit « comment l'homme s'éternise » et lui annonce un avenir glorieux mais persécuté."],
    "fraude": ["Dans la huitième fosse, Ulysse, enveloppé avec Diomède dans une flamme à deux pointes, raconte son dernier voyage : poussé par la soif de connaissance, il franchit les colonnes d'Hercule avec ses compagnons — « Vous n'avez pas été faits pour vivre comme des brutes, mais pour suivre vertu et connaissance » — avant que leur navire ne sombre en vue de la montagne du Purgatoire. Dans la cinquième fosse, les démons Malebranche escortent les poètes et tentent de les tromper : l'épisode est l'un des plus comiques du poème."],
    "trahison": ["Dans l'Anténora, le comte Ugolin della Gherardesca interrompt son « repas bestial » sur le crâne de l'archevêque Ruggieri pour raconter son histoire : trahi et enfermé avec ses fils et petits-fils dans la tour de la Faim à Pise, il les vit mourir un à un. « Puis, plus que la douleur, le jeûne eut pouvoir » : ce vers ambigu laisse planer l'horreur. Dans la Ptolomée, frère Albéric révèle que l'âme de certains traîtres tombe en Enfer dès la trahison, tandis qu'un démon habite leur corps encore vivant sur terre."],
}


if __name__ == "__main__":
    doc = SimpleDocTemplate(SORTIE, pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm, topMargin=1.9 * cm, bottomMargin=1.8 * cm,
                            title="L'Enfer de Dante", author="Simulation Enfer de Dante", subject="Les neuf cercles de l'Inferno")
    doc.build(construire(), onFirstPage=fond, onLaterPages=fond)
    print("PDF généré :", SORTIE)
