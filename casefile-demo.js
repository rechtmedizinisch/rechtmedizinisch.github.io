if(!Array.prototype.flatMap){Object.defineProperty(Array.prototype,'flatMap',{value:function(fn,context){var out=[];this.forEach(function(value,index){var mapped=fn.call(context,value,index,this);if(Array.isArray(mapped))out.push.apply(out,mapped);else out.push(mapped);},this);return out;},configurable:true,writable:true});}
if(!Object.fromEntries){Object.defineProperty(Object,'fromEntries',{value:function(entries){var out={};entries.forEach(function(entry){Object.defineProperty(out,entry[0],{value:entry[1],enumerable:true,writable:true,configurable:true});});return out;},configurable:true,writable:true});}
var RMCasefile = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // content-update/input-20261106-practice-ux/draft/demo/casefile-runtime.mjs
  var casefile_runtime_exports = {};
  __export(casefile_runtime_exports, {
    ENGINE_VERSION: () => ENGINE_VERSION,
    RULESET_VERSION: () => RULESET_VERSION,
    createRuntime: () => createRuntime,
    dispatchJSON: () => dispatchJSON,
    runtime: () => runtime
  });

  // content-update/input-20261106-practice-ux/draft/demo/case-data.mjs
  var ACTIONS = [{ "id": "A01", "title": "Anzeige und Anlage lesen", "desc": "Vorwurf, Erinnerung und Strafantrag auseinanderhalten.", "icon": "file", "type": "read", "docs": ["D00", "D01a"], "group": "Einstieg" }, { "id": "A02", "title": "Anfangsverdacht prüfen", "desc": "Was rechtfertigt Ermittlungen – und was noch keine Anklage?", "icon": "scale", "type": "legal", "group": "Einstieg" }, { "id": "A03", "title": "Patientin vernehmen", "desc": "Ursprünglichen Willen und Erinnerung an den OP-Morgen klären.", "icon": "person", "docs": ["D04"], "interview": "patient", "group": "Menschen" }, { "id": "A04", "title": "Behandlungsakte anfordern", "desc": "Vollständigen Bogen, OP-Bericht und Anästhesieprotokoll erhalten.", "icon": "folder", "docs": ["D01b", "D02", "D03"], "type": "job", "release": true, "group": "Unterlagen" }, { "id": "A05", "title": "Beschuldigtenanhörung veranlassen", "desc": "Vorwurf mitteilen, belehren und angemessene Gelegenheit zur Äußerung einräumen.", "icon": "shield", "docs": ["D06"], "interview": "defense", "group": "Menschen" }, { "id": "A06", "title": "Polizei gezielt beauftragen", "desc": "Eine konkrete Person oder Ermittlungsfrage benennen.", "icon": "search", "type": "delegate", "group": "Aufträge" }, { "id": "A07", "title": "Polizeilichen Sachstand erfragen", "desc": "Nach bereits vorliegenden weiteren Ergebnissen fragen.", "icon": "phone", "type": "status", "group": "Aufträge" }, { "id": "A08", "title": "Jan Bremer vernehmen", "desc": "Eigene Wahrnehmung und zeitliche Grenzen der Pflegeübergabe prüfen.", "icon": "person", "docs": ["D05"], "interview": "bremer", "release": true, "group": "Menschen" }, { "id": "A09", "title": "Präoperatives Personal ermitteln", "desc": "Gezielte Dienst- und Raumzuordnung für das relevante Zeitfenster.", "icon": "search", "docs": ["D07"], "type": "job", "group": "Aufträge" }, { "id": "A10", "title": "Präoperative Pflegekraft vernehmen", "desc": "Einen möglichen Gesprächszeugen identifizieren und hören.", "icon": "person", "docs": ["D08"], "interview": "faber", "release": true, "requires": "faber", "group": "Menschen" }, { "id": "A11", "title": "Begleitperson vernehmen", "desc": "Eine fallbezogen identifizierte Begleitperson zu eigener und mittelbarer Kenntnis befragen.", "icon": "person", "docs": ["D12"], "interview": "lukas", "group": "Menschen" }, { "id": "A12", "title": "Medizinisches Gutachten beauftragen", "desc": "Standard, Dringlichkeit und mögliche Folgen sachverständig klären.", "icon": "medical", "docs": ["D09"], "type": "job", "waitFor": ["D01b", "D02"], "release": true, "group": "Unterlagen" }, { "id": "A13", "title": "Original und Metadaten prüfen", "desc": "Verfügbarkeit und Versionsstand von Gesprächsinhalten unterscheiden.", "icon": "search", "docs": ["D10"], "type": "job", "waitFor": ["D01b"], "group": "Unterlagen" }, { "id": "A14", "title": "Ergänzende Erklärung anregen", "desc": "Dr. Falk erhält Gelegenheit, konkrete Widersprüche freiwillig zu erläutern.", "icon": "talk", "docs": ["D11"], "requires": "defense", "group": "Menschen" }, { "id": "A15", "title": "Beweissicherung prüfen", "desc": "Freiwillige Übermittlung oder begründeten richterlichen Antrag wählen.", "icon": "shield", "type": "seizure", "group": "Unterlagen" }, { "id": "A16", "title": "Beweise zusammenführen", "desc": "Belastung, Entlastung und offene Fragen nebeneinander sehen.", "icon": "scale", "type": "review", "group": "Auswertung" }, { "id": "A17", "title": "Entscheidung vorbereiten", "desc": "Mit dem aktuellen Kenntnisstand Einstellung oder Anklage prüfen.", "icon": "court", "type": "decision", "group": "Auswertung" }, { "id": "A18", "title": "Ausgleich und Verhältnisse klären", "desc": "Fallbezogene Grundlagen für Auflagen oder Rechtsfolgen erhalten.", "icon": "coins", "docs": ["D13", "D14"], "group": "Aufträge" }, { "id": "A19", "title": "Dr. Sina Keller vernehmen", "desc": "Die aufklärende Ärztin zum ursprünglichen Vorbehalt hören.", "icon": "person", "docs": ["D15"], "interview": "keller", "release": true, "group": "Menschen" }];
  var CASE_ID = "lindenbogen-2026";
  var EVIDENCE = { "D00": { "title": "Strafanzeige und Strafantrag", "kind": "Anzeige", "author": "Mara Seidel", "date": "06.10.2026", "tag": "Eingang", "body": "An die Polizei Lindenhafen\nBetreff: Strafanzeige und Strafantrag wegen meiner Knieoperation\n\nMein Name ist Mara Seidel, ich bin 34 Jahre alt. Am 16. September 2026 wurde ich in der Klinik Lindenbogen am rechten Knie operiert. Operiert hat Dr. Jonas Falk.\n\nIm Aufklärungsgespräch mit Dr. Sina Keller hatten wir über eine Gelenkspiegelung und eine mögliche Naht am Meniskus gesprochen. Auf dem Aufklärungsbogen habe ich ausdrücklich festhalten lassen, dass ohne erneute Besprechung kein Meniskusgewebe entfernt werden soll. Eine Kopie lege ich bei.\n\nIm später erhaltenen OP-Bericht steht eine Meniskusteilresektion. Ich erinnere mich nicht, dass ich dazu noch einmal ja gesagt hätte. Am OP-Morgen war alles hektisch. Dr. Falk war kurz bei mir. Ich weiß noch den Satz, dass man es wie besprochen machen werde. Ob und was darüber hinaus gesagt wurde, kann ich heute nicht mehr vollständig wiedergeben.\n\nNach der Operation hatte ich Schmerzen und war zunächst eingeschränkt. Ob das durch die Entfernung anders war als nach einer anderen Behandlung, kann ich selbst nicht beurteilen. Mir geht es vor allem darum, dass ohne Rückfrage Gewebe entfernt worden sein könnte.\n\nBitte klären Sie, was passiert ist. Ich stelle ausdrücklich Strafantrag gegen Dr. Falk und gegebenenfalls weitere verantwortliche Personen. Ich bin bereit, meine eigenen Behandlungsunterlagen zur Verfügung zu stellen und eine konkret begrenzte Schweigepflichtentbindung zu erklären.\n\nMara Seidel\nAnlage: Kopie des Aufklärungsbogens", "limit": "Die Anzeige beschreibt eine Erinnerung und einen Vorwurf. Sie beweist weder fehlende Einwilligung noch strafrechtliche Schuld.", "claims": ["complaint", "application"], "id": "D00" }, "D01a": { "title": "Aufklärungsbogen · Patientenkopie", "kind": "Dokument", "author": "Dr. Sina Keller / Mara Seidel", "date": "09.09.2026", "body": "Vorgesehener Eingriff: Arthroskopie des rechten Knies.\nMögliche Verfahren: Meniskusnaht, gegebenenfalls begrenzte Teilresektion.\n\nHandschriftlicher Zusatz:\n„Keine Meniskusteilresektion ohne erneute Besprechung mit mir.“\n\nDatum und Unterschriften der aufklärenden Ärztin und der Patientin sind vorhanden.", "limit": "Der konkrete Vorbehalt ist erheblich. Ob er später geändert wurde, ergibt sich aus dieser Kopie nicht.", "claims": ["restriction"], "id": "D01a" }, "D01b": { "title": "Vollständiger Aufklärungsbogen", "kind": "Gesicherter Export", "author": "Dokumentenarchiv der Klinik", "date": "09.09.2026 · Export im Ermittlungsverfahren", "body": "Dr. Sina Keller führte am 9. September die Aufklärung durch. Dr. Falk nahm an diesem Gespräch nicht teil. Die Möglichkeiten einer Naht und einer kleinen Teilresektion einschließlich unterschiedlicher Belastungen wurden erläutert.\n\nDie Patientin erklärte zunächst keine uneingeschränkte Freigabe. Der handschriftliche Zusatz stimmt mit ihrer Kopie überein: Keine Teilresektion ohne erneute Besprechung.\n\nEine später unterschriebene Ergänzung liegt nicht vor. Das vollständige Original ist unverändert archiviert.", "limit": "Eine fehlende weitere Unterschrift beweist nicht, dass es keine wirksame mündliche Änderung gab.", "claims": ["restriction", "priorInformation"], "id": "D01b" }, "D02": { "title": "Operationsbericht", "kind": "Dokument", "author": "Dr. Jonas Falk", "date": "16.09.2026 · fertiggestellt 12:08 Uhr", "body": "Arthroskopie rechtes Knie, Beginn 09:36 Uhr. Intraoperativ instabiles kleines Meniskusfragment. Um 09:48 Uhr begrenzte Teilresektion eines kleinen Gewebeanteils. Ende des Eingriffs 10:15 Uhr. Keine Komplikation dokumentiert.\n\nFallannahme: Eine begrenzte Teilresektion war medizinisch vertretbar. Es bestand keine akute vitale Bedrohung. Ein Abbruch mit späterer erneuter Besprechung war medizinisch nicht ausgeschlossen.", "limit": "Der Bericht belegt einen körperlichen Eingriff. Er belegt nicht den Inhalt einer Einwilligungserklärung.", "claims": ["intervention", "limitedExtent"], "id": "D02" }, "D03": { "title": "Anästhesie- und Vorbereitungsprotokoll", "kind": "Dokument", "author": "Dr. Nele Hartung", "date": "16.09.2026", "body": "Vor 09:12 Uhr: Patientin orientiert und gesprächsfähig beschrieben.\n09:12 Uhr: erste dokumentierte Gabe eines bewusstseinsdämpfenden Medikaments.\n09:36 Uhr: Beginn des Eingriffs.\n\nDas Protokoll enthält keinen Wortlaut einer Freigabe zur Teilresektion.", "limit": "Einwilligungsfähigkeit ist individuell und entscheidungsbezogen zu prüfen. Die spätere Medikation macht ein früheres Gespräch nicht rückwirkend unwirksam.", "claims": ["medicationTime"], "id": "D03" }, "D04": { "title": "Vernehmung der Patientin", "kind": "Zeugenaussage", "author": "Mara Seidel", "date": "Ermittlungsverfahren", "body": "„Ich habe die Einschränkung bewusst eintragen lassen. Ich wollte vor einer Entfernung erneut darüber sprechen. Ich erinnere eine kurze Begegnung am Morgen, aber nicht mehr jedes Wort.\n\nEine Pflegekraft war zunächst in der Nähe; später kam Herr Bremer. Den Namen der ersten Pflegekraft kenne ich nicht. Mein Begleiter Lukas Ehlers war nicht im Vorbereitungsraum.\n\nDie anfänglichen Schmerzen sind weitgehend zurückgegangen. Einen zusätzlichen dauerhaften Schaden hat mir niemand sicher bestätigt.“", "limit": "Erinnerungslücken, eigener Wille und objektiver Gesprächsablauf sind auseinanderzuhalten.", "claims": ["patientUncertain", "personnelLead"], "id": "D04" }, "D05": { "title": "Vernehmung Jan Bremer", "kind": "Zeugenaussage", "author": "Jan Bremer · Pflege", "date": "Ermittlungsverfahren", "body": "„Ich übernahm gegen 09:05 Uhr. Dr. Falk sagte sinngemäß, es werde wie vereinbart vorgegangen. Beim vorausgegangenen Gespräch war ich nicht dabei.\n\nEine ausdrückliche Zustimmung zur Teilresektion habe ich nicht selbst gehört. Ich kann aber nicht beurteilen, was vor meiner Übernahme besprochen wurde. Lena Faber war vorher im Vorbereitungsbereich.“", "limit": "Nicht selbst gehörte Zustimmung beweist nicht, dass vor 09:05 Uhr keine Zustimmung erklärt wurde.", "claims": ["limitedWitness", "faberIdentified"], "id": "D05" }, "D06": { "title": "Verteidigung und Beschuldigtenanhörung", "kind": "Verteidigerkorrespondenz", "author": "Rechtsanwältin Eva Kern", "date": "Ermittlungsverfahren", "body": "Der Vorwurf wurde mitgeteilt. Dr. Falk wurde über Schweigerecht und Verteidigungsmöglichkeit belehrt. Nach angemessen eingeräumter Gelegenheit erklärt die Verteidigerin:\n\n„Wir nehmen Akteneinsicht. Mein Mandant macht zunächst keine Angaben. Schweigen ist kein Schuldeingeständnis. Bitte klären Sie die präoperative Besprechung und das dabei anwesende Personal auf.“\n\nFür den Fall ist nach gewährter Akteneinsicht zunächst das Festhalten an der Aussageverweigerung gesetzt. Eine zugesagte laufende Stellungnahmefrist wird nicht abgekürzt.", "limit": "Dokumentierte Gelegenheit zur Äußerung ist von einer bloß abgesandten Einladung zu unterscheiden. Schweigen ist hier kein Belastungsbeweis.", "claims": ["defenseOpportunity", "personnelLead"], "id": "D06" }, "D06b": { "title": "Konkreter Entlastungsbeweisantrag", "kind": "Verteidigerkorrespondenz", "author": "Rechtsanwältin Eva Kern", "date": "Ergänzender Schriftsatz", "body": "„Bitte vernehmen Sie Lena Faber zu ihren eigenen Wahrnehmungen eines möglichen Gesprächs vor der Operation. Wir beantragen die Erhebung dieses Beweises zur Entlastung.“", "limit": "Ein erheblicher beantragter Entlastungsbeweis darf nicht einfach übergangen werden. Bereits vollständig erhobene Ergebnisse können den Antrag erledigen.", "claims": ["faberIdentified", "defenseRequest"], "id": "D06b" }, "D07": { "title": "Dienst- und Raumzuordnung", "kind": "Dokument", "author": "Klinikverwaltung", "date": "16.09.2026", "body": "08:45–09:05 Uhr: Lena Faber im präoperativen Bereich.\nAb 09:05 Uhr: Jan Bremer übernimmt die weitere Vorbereitung.\n\nÜbermittelt werden nur fallbezogene Angaben zu diesem Zeitfenster.", "limit": "Die Zuordnung belegt eine Anwesenheitsmöglichkeit. Ein Gesprächsinhalt folgt daraus nicht.", "claims": ["faberIdentified", "timeContext"], "id": "D07" }, "D08": { "title": "Vernehmung Lena Faber", "kind": "Zeugenaussage", "author": "Lena Faber · Pflege", "date": "Ermittlungsverfahren / gerichtliche Vernehmung", "body": "„Ich war bei Frau Seidel, als Dr. Falk kam, noch vor der ersten beruhigenden Medikation. Er sprach die Einschränkung auf dem Bogen ausdrücklich an. Er erklärte die bereits besprochenen Alternativen erneut: möglichst nähen, bei nicht sinnvoller Naht einen kleinen instabilen Anteil begrenzt entfernen.\n\nFrau Seidel fragte, ob sie auch Nein sagen könne. Das wurde bejaht. Sie erklärte dann sinngemäß: Wenn eine Naht nicht sinnvoll ist, dürfen Sie den kleinen Anteil entfernen. Auf Nachfrage sagte sie, es sei für sie geklärt. Eine weitere Unterschrift habe ich nicht gesehen.“\n\nDie Zeugin unterscheidet sinngemäße Erinnerung und exakten Wortlaut. Sie ordnet die Zeit anhand ihrer Übergabe ein; eine persönliche Nähe zu den Beteiligten besteht nach ihren Angaben nicht.", "limit": "Standort, zeitliche Einordnung, Erinnerungsgrundlage und mögliche Verwechslung kritisch prüfen. Auch eine neutrale Zeugin ist nicht unfehlbar.", "claims": ["laterConsentWitness"], "id": "D08" }, "D09": { "title": "Medizinisches Sachverständigengutachten", "kind": "Gutachten", "author": "Prof. Dr. Vera Thal", "date": "Ermittlungsverfahren", "body": "Die Akten sprechen unter den gesetzten Voraussetzungen für eine fachlich vertretbare, begrenzte Teilresektion. Daraus folgt keine Aussage über eine wirksame Zustimmung.\n\nEs bestand keine akute Lage, in der Aufschub und erneute Besprechung medizinisch unvertretbar gewesen wären. Ein zusätzlicher Dauerschaden lässt sich den Unterlagen nicht sicher zuordnen. Die Gewebeentfernung ist gleichwohl ein körperlicher Eingriff. Die anfänglichen Beschwerden erlauben keine sichere Zuordnung besonderer Folgen.\n\nGesprächsinhalt und strafrechtliche Schuld entscheidet nicht die Sachverständige.", "limit": "Medizinische Vertretbarkeit und rechtliche Rechtfertigung sind getrennte Fragen.", "claims": ["noEmergency", "technicalStandard", "noProvenPermanentHarm"], "id": "D09" }, "D09b": { "title": "Ergänzung des Gutachtens", "kind": "Ergänzungsgutachten", "author": "Prof. Dr. Vera Thal", "date": "Nach technischem Befund", "body": "Der technische Befund ändert die medizinische Grundbewertung nicht. Über ein mündliches Gespräch trifft die Technik keine Aussage.", "limit": "Das erste Gutachten bleibt erhalten. Dies ist eine gesonderte Ergänzung aufgrund neuer Informationen.", "claims": [], "id": "D09b" }, "D10": { "title": "Technischer Dokumentationsbericht", "kind": "Technischer Befund", "author": "Robin Maas · IT", "date": "Gesicherte Originaldaten", "body": "Das Original vom 9. September enthält den Vorbehalt. Auch die verfügbare vollständige Ansicht enthielt ihn. Ein später Erstellungszeitpunkt des OP-Berichts beweist keine Täuschung. Über gesprochene Worte geben diese Daten keinen Aufschluss.", "limit": "Dokumentzustand, Verfügbarkeit, tatsächliche Wahrnehmung und mündlicher Inhalt sind verschiedene Beweisfragen.", "claims": ["fullDocumentAvailable"], "id": "D10" }, "D11": { "title": "Freiwillige Erklärung Dr. Falks", "kind": "Eigene schriftliche Erklärung", "author": "Dr. Jonas Falk", "date": "Nach anwaltlicher Beratung", "body": "„Ich kannte den Vorbehalt und habe ihn vor der Operation angesprochen. Frau Seidel hat nach erneuter Erläuterung die begrenzte Entfernung für den Fall freigegeben, dass eine Naht nicht sinnvoll ist. Frau Faber war dabei.“", "limit": "Eigene unterschriebene freiwillige Erklärung, nicht bloß Wiedergabe durch eine andere Person. Für die Hauptverhandlung ist ihre Einführung zu prüfen.", "claims": ["consentClaim"], "id": "D11" }, "D12": { "title": "Vernehmung Lukas Ehlers", "kind": "Zeugenaussage", "author": "Lukas Ehlers · Begleitperson", "date": "Ermittlungsverfahren", "body": "„Ich brachte Mara in die Klinik und wartete außerhalb des Vorbereitungsbereichs. Bei der Aufklärung und dem möglichen Gespräch am Morgen war ich nicht dabei. Nach der Operation war sie über den Bericht verärgert. Den Gesprächsinhalt kenne ich nur aus ihrer späteren Schilderung.“", "limit": "Mittelbare Kenntnis. Er kann den Einwilligungsinhalt nicht aus eigener Wahrnehmung bestätigen.", "claims": ["hearsay"], "id": "D12" }, "D13": { "title": "Persönliche und wirtschaftliche Angaben", "kind": "Fallannahme für Rechtsfolgen", "author": "Fiktive Verfahrensakte", "date": "Rechtsfolgenprüfung", "body": "Keine Vorverurteilungen. Der Dokumentationsablauf wurde nach dem Vorfall überprüft. Für das Lehrmodell bereits unter Berücksichtigung persönlicher Verhältnisse ermitteltes tägliches Nettoeinkommen: 120 Euro.\n\nDieser Wert ist eine vereinfachte Fallannahme, keine allgemeine Rechenregel für jedes Monatseinkommen.", "limit": "Nachtatverhalten beseitigt eine frühere Tat nicht automatisch. Anzahl und Höhe der Tagessätze sind zu unterscheiden.", "claims": ["economicBasis"], "id": "D13" }, "D14": { "title": "Bereitschaft zum Ausgleich", "kind": "Verfahrenskorrespondenz", "author": "Beteiligte", "date": "Prüfung einer Erledigung", "body": "Der Beschuldigte möchte die Einwilligungsfrage sachlich aufklären lassen und stimmt einem Auflagenpaket derzeit nicht zu. Aus einer Ablehnung folgt keine Schuld.", "limit": "Bereitschaft zum Gespräch ersetzt keine Zustimmung zu einem bestimmten Auflagenpaket.", "claims": [], "id": "D14" }, "D15": { "title": "Vernehmung Dr. Sina Keller", "kind": "Zeugenaussage", "author": "Dr. Sina Keller · Aufklärung", "date": "Ermittlungsverfahren", "body": "„Ich führte am 9. September die Aufklärung durch. Die Alternativen wurden erläutert. Frau Seidel wollte eine Entfernung nicht ohne erneute Besprechung freigeben. Deshalb der Zusatz. Über den OP-Morgen und ein späteres Gespräch mit Dr. Falk habe ich keine eigene Wahrnehmung.“", "limit": "Die ursprüngliche Einschränkung wird bestätigt. Eine spätere Änderung wird weder bewiesen noch ausgeschlossen.", "claims": ["restriction", "priorInformation"], "id": "D15" }, "H06": { "title": "Mündliche Einlassung in der Hauptverhandlung", "kind": "Mündliche Einlassung", "author": "Dr. Jonas Falk", "date": "Hauptverhandlung", "body": "„Ich kannte den Vorbehalt und habe ihn vor der Operation angesprochen. Frau Seidel hat nach erneuter Erläuterung die begrenzte Entfernung für den Fall freigegeben, dass eine Naht nicht sinnvoll ist. Frau Faber war dabei.“", "limit": "Die freiwillige mündliche Äußerung ist Teil des Inbegriffs der Hauptverhandlung. Das frühere Schriftstück D11 ist eine davon getrennte Quelle; vollständiges Schweigen wäre kein Schuldbeweis.", "claims": ["consentClaim"], "id": "H06" } };
  var GLOSSARY = [["Anfangsverdacht", "Konkrete tatsächliche Anhaltspunkte rechtfertigen Ermittlungen. Eine Anzeige beweist den behaupteten Vorwurf noch nicht.", "suspicion"], ["Hinreichender Tatverdacht", "Nach vorläufiger Bewertung ist eine Verurteilung wahrscheinlicher als ein Freispruch. Diese Prognose trägt Anklage und Eröffnung; sie ist kein Schuldspruch.", "opening"], ["Überzeugung von der Schuld", "Zur Verurteilung genügt eine überwiegende Wahrscheinlichkeit nicht. Nicht überwindbare vernünftige Zweifel wirken zugunsten der angeklagten Person.", "conviction"], ["Objektive Staatsanwaltschaft", "Die Staatsanwaltschaft ermittelt Belastendes und Entlastendes. Sie ist nicht die Anwältin der Patientin.", "objectivity"], ["Einlassung", "Die beschuldigte Person äußert sich zum Vorwurf. Sie darf schweigen. Vollständiges Schweigen wird im Spiel nicht als Belastung gewertet.", "rights"], ["Auflage oder Geldstrafe?", "Eine Geldzahlung nach § 153a ist keine Geldstrafe. § 153 sieht keine Auflagen vor. Die gesetzlichen Voraussetzungen und nötigen Zustimmungen müssen erfüllt sein.", "conditions"], ["Akte oder gerichtlicher Beweis?", "Eine gelesene Ermittlungsakte ist nicht automatisch in der Hauptverhandlung bewiesen. Zeugenaussagen und Dokumente müssen in geeigneter Form eingeführt werden.", "witness"], ["Einwilligung", "Indikation, technische Durchführung und Zustimmung sind verschiedene Fragen. Eine wirksame mündliche Erklärung kann erheblich sein; ein unterschriebener Bogen deckt nicht automatisch jede Erweiterung.", null], ["Beweisantrag", "Eine konkrete erhebliche Tatsache soll durch ein bestimmtes Beweismittel belegt werden. Eine vage Bitte um weitere Ermittlungen ist nicht automatisch ein förmlicher Beweisantrag.", "proof"], ["Approbation", "Ein Ruhen der Approbation ist eine eigene behördliche Entscheidung. Es lässt sich nicht als zusätzliche staatsanwaltschaftliche §-153a-Sanktion buchen.", "approbation"], ["Eröffnung und Nichteröffnung", "Das Gericht prüft den hinreichenden Tatverdacht. Anklage allein eröffnet das Hauptverfahren nicht. Eine Nichteröffnung ist kein Freispruch. Rechtsbehelfe der Staatsanwaltschaft und die Voraussetzungen eines späteren Vorgehens nach Nichteröffnung sind gesondert geregelt.", "nonopening"], ["Welche Gerichte?", "Im gesetzten Kernfall entscheidet das Amtsgericht als Strafrichter: erwachsene Person, Vergehen und keine höhere Straferwartung als zwei Jahre. Andere Fälle können zum Schöffengericht oder Landgericht gehören. Die Art des medizinischen Berufs allein bestimmt die Zuständigkeit nicht.", "jurisdiction"], ["Strafbefehl als weiterer Weg", "Bei gesetzlich geeigneten Vergehen kann die Staatsanwaltschaft einen Strafbefehl beantragen. Das Gericht entscheidet ohne vorausgehende Hauptverhandlung. Ein fristgerechter Einspruch kann zur Hauptverhandlung führen. Dieser zusätzliche reale Weg wird erläutert; der spielbare Kern verwendet die Anklage.", "penalOrder"], ["§ 153 ohne Zahlung", "Geringe hypothetische Schuld und fehlendes öffentliches Verfolgungsinteresse sind enger zu prüfen als § 153a. Vor Anklage ist keine Zustimmung des Beschuldigten erforderlich. Die gerichtliche Zustimmung entfällt nur bei den gesetzlichen Voraussetzungen der Ausnahme. Nach Anklage entscheidet das Gericht; grundsätzlich sind Staatsanwaltschaft und Angeschuldigter zu beteiligen.", "minor"], ["Weitere Auflagen und Fristen", "§ 153a nennt auch gemeinnützige Leistungen, Unterhalt, sozialen Trainingskurs, bestimmte Verkehrsseminare und Therapieweisung. Nicht alles passt zu diesem Lehrfall. Die Grundfrist für die hier angebotenen Module ist höchstens sechs Monate; die Frist kann gesetzlich einmal um drei Monate verlängert werden. Nicht erfüllte Auflagen führen zur weiteren Verfolgungsprüfung, nicht automatisch zur Strafe. Bereits erbrachte Leistungen werden dann nicht erstattet.", "conditions"], ["Nach einer Einstellung", "Für die antragstellende verletzte Person ist ein begründeter Bescheid vorgesehen. § 172 regelt die Beschwerde und unter engen Voraussetzungen einen gerichtlichen Antrag. Ein Klageerzwingungsverfahren ist insbesondere bei ausschließlich privatklagefähigen Delikten und den dort bezeichneten Opportunitätseinstellungen ausgeschlossen. Körperverletzung nach §§ 223, 229 kann unter § 374 fallen. Es besteht kein allgemeiner Anspruch auf Anklage.", "notifications"], ["Einwilligungsirrtum und Fahrlässigkeit", "Der bekannte entgegenstehende Wille ist von einem Irrtum über tatsächliche Rechtfertigungsvoraussetzungen zu unterscheiden. Im gesetzten Fall C führt die Prüfung des vermeidbaren Irrtums zum möglichen Fahrlässigkeitsvorwurf. Dogmatische Einzelheiten des Erlaubnistatbestandsirrtums sind eine Vertiefung; nicht jedes objektive Einwilligungsdefizit begründet Vorsatz.", "medicalCase"], ["Keine zivilrechtliche Beweislastumkehr", "Die zivilrechtlichen Regeln des § 630h BGB werden nicht gegen den strafrechtlich Beschuldigten übertragen. Ein schlechter Ausgang, eine fehlende Unterschrift oder ein später Zeitstempel ersetzen den strafrechtlichen Tatnachweis nicht.", "conviction"], ["Zeugnis und Beschlagnahme", "§§ 53 und 53a schützen bestimmte beruflich erlangte Informationen. Eine Entbindung ist auf die betroffene Behandlung zu begrenzen. Bei § 97 sind Gewahrsam, Schutzrichtung und gesetzliche Ausnahmen zu prüfen, gerade bei Tatverdacht gegen einen Berufsgeheimnisträger. Der Beschuldigte selbst bleibt aus seinem Schweigerecht geschützt. Ein Richterbeschluss setzt diese Prüfung nicht außer Kraft.", "protection"], ["Schriftliche und mündliche Einlassung", "Die aussagebereite angeklagte Person wird grundsätzlich mündlich befragt. Sie kann nicht durch ein bloßes Verlesungsverlangen diese Form ersetzen. Soll eine frühere eigene schriftliche Erklärung als solche verwertet werden, ist ihre geeignete förmliche Einführung zu prüfen. Die Simulation unterscheidet beides und verwendet keine polizeiliche Niederschrift als austauschbare Urkunde.", "admissionCase"]];
  var INTERVIEWS = { "patient": { "name": "Mara Seidel", "role": "Patientin · Zeugin", "doc": "D04", "questions": [["restriction", "Was wollten Sie ursprünglich freigeben?", "Die Möglichkeiten wurden besprochen. Eine Entfernung wollte ich zunächst nicht ohne erneute Besprechung freigeben."], ["morning", "Woran erinnern Sie sich am OP-Morgen sicher?", "Ich erinnere die kurze Begegnung und „wie besprochen“. Nicht jedes Wort ist mir heute sicher präsent."], ["people", "Wer könnte das Gespräch wahrgenommen haben?", "Zunächst war eine andere Pflegekraft in der Nähe, danach Herr Bremer. Lukas Ehlers wartete außerhalb."], ["harm", "Welche Folgen können Sie selbst schildern?", "Die Schmerzen gingen weitgehend zurück. Einen zusätzlichen Dauerschaden kann ich nicht selbst beurteilen."], ["suggestive", "„Der Arzt hat Sie also bewusst gegen Ihren Willen operiert?“", "Was er gedacht hat, weiß ich nicht. Ich kann nur meinen Willen und meine Erinnerung beschreiben.", "Grenze: Diese Frage legt bereits eine subjektive Tatbewertung nahe. Sachlich nach konkreten Wahrnehmungen fragen."], ["medication", "Wann bekamen Sie das beruhigende Mittel?", "Den Zeitpunkt weiß ich nicht mehr sicher. Bitte gleichen Sie ihn mit den Unterlagen ab."], ["confront", "Wie ordnen Sie Fabers Schilderung ein?", "Ich behaupte nicht, dass Frau Faber lügt. Ich erinnere eine Freigabe nicht sicher. Mein ursprünglicher Vorbehalt war mir wichtig."]] }, "bremer": { "name": "Jan Bremer", "role": "Pflegefachperson · Zeuge", "doc": "D05", "questions": [["time", "Seit wann waren Sie bei der Patientin?", "Ich übernahm gegen 09:05 Uhr."], ["consent", "Haben Sie selbst eine ausdrückliche Zustimmung gehört?", "Nein. Das Gespräch davor habe ich nicht gehört."], ["exclude", "Können Sie ein früheres Gespräch ausschließen?", "Nein. Meine Wahrnehmung beginnt erst mit meiner Übernahme."], ["name", "Wer war vorher zuständig?", "Lena Faber. Das kann die Einsatzplanung bestätigen."]] }, "defense": { "name": "Eva Kern für Dr. Falk", "role": "Verteidigung · Beschuldigtenrechte", "doc": "D06", "questions": [["silence", "Wie ist die vorläufige Aussageverweigerung zu bewerten?", "Sie ist Ausübung eines Rechts und kein Schuldeingeständnis."], ["files", "Wie wird mit dem Akteneinsichtsgesuch umgegangen?", "Akteneinsicht wird gesetzeskonform gewährt. Eine angemessen eingeräumte Gelegenheit wird nicht durch vorschnellen Abschluss entwertet."], ["name", "Welche konkrete Person soll zur Entlastung gehört werden?", "Lena Faber kommt als Gesprächszeugin in Betracht. Ihre Vernehmung wird als erheblicher Entlastungsbeweis beantragt.", "Ein konkreter erheblicher Antrag ist nun offen; bereits vollständig erhobene Ergebnisse können ihn erledigen."]] }, "faber": { "name": "Lena Faber", "role": "Pflegefachperson · Zeugin", "doc": "D08", "questions": [["perception", "Was haben Sie selbst wahrgenommen?", "„Ich war bei Frau Seidel, als Dr. Falk kam, noch vor der ersten beruhigenden Medikation. Er sprach die Einschränkung auf dem Bogen ausdrücklich an. Er erklärte die bereits besprochenen Alternativen erneut: möglichst nähen, bei nicht sinnvoller Naht einen kleinen instabilen Anteil begrenzt entfernen.\n\nFrau Seidel fragte, ob sie auch Nein sagen könne. Das wurde bejaht. Sie erklärte dann sinngemäß: Wenn eine Naht nicht sinnvoll ist, dürfen Sie den kleinen Anteil entfernen. Auf Nachfrage sagte sie, es sei für sie geklärt. Eine weitere Unterschrift habe ich nicht gesehen.“\n\nDie Zeugin unterscheidet sinngemäße Erinnerung und exakten Wortlaut. Sie ordnet die Zeit anhand ihrer Übergabe ein; eine persönliche Nähe zu den Beteiligten besteht nach ihren Angaben nicht."], ["time", "Wie ordnen Sie die Zeit ein?", "Anhand meiner Übergabe an Herrn Bremer gegen 09:05 Uhr. Ich trenne meine Erinnerung vom bloßen Dienstplaneintrag."], ["certainty", "Ist Ihre Schilderung ein wörtliches Zitat?", "Ich gebe den Inhalt sinngemäß wieder. Es gibt keine Tonaufnahme."], ["bias", "Besteht persönliche Nähe zu einem Beteiligten?", "Nein. Ich war dort im regulären Dienst. Meine Wahrnehmung bleibt dennoch kritisch zu prüfen."], ["context", "Was können Sie zu Standort und Kontext sagen?", "Ich war im präoperativen Bereich bei Frau Seidel. Meine Angaben beruhen auf eigener Erinnerung und der zeitlichen Einordnung zur Übergabe. Der Dienstplan allein beweist keinen Gesprächsinhalt."], ["choice", "Welche eigene Wahrnehmung haben Sie zur Ablehnungsmöglichkeit?", "Frau Seidel fragte, ob sie Nein sagen könne. Das wurde bejaht. Ich gebe den Inhalt sinngemäß wieder."]] }, "lukas": { "name": "Lukas Ehlers", "role": "Begleitperson · Zeuge", "doc": "D12", "questions": [["own", "Waren Sie beim Gespräch selbst dabei?", "Nein, ich wartete außerhalb."], ["source", "Woher kennen Sie den Vorwurf?", "Mara erzählte mir nach der Operation davon. Eine eigene Einwilligungserklärung habe ich nicht gehört."]] }, "keller": { "name": "Dr. Sina Keller", "role": "Aufklärende Ärztin · Zeugin", "doc": "D15", "questions": [["restriction", "Wozu erklärte die Patientin am 9. September ihre Zustimmung?", "Sie wollte die Entfernung nicht ohne erneute Besprechung freigeben. Deshalb der Zusatz."], ["later", "Wissen Sie, was am OP-Morgen besprochen wurde?", "Nein. Dazu habe ich keine eigene Wahrnehmung."]] }, "expert": { "name": "Prof. Dr. Vera Thal", "role": "Medizinische Sachverständige", "doc": "D09", "questions": [["standard", "War die Teilresektion fachlich vertretbar?", "Unter den gesetzten medizinischen Voraussetzungen ja. Das beantwortet die rechtliche Einwilligungsfrage nicht."], ["urgency", "Musste sofort erweitert werden?", "Es bestand keine Lage, in der ein Aufschub und eine erneute Besprechung medizinisch unvertretbar gewesen wären."], ["effects", "Welche Folgen sind sicher zuzuordnen?", "Ein zusätzlicher Dauerschaden ist nicht sicher zuzuordnen. Die Gewebeentfernung bleibt ein körperlicher Eingriff. Die anfänglichen Beschwerden erlauben keine sichere Unterscheidung."], ["consent", "Können Sie eine wirksame Einwilligung beweisen?", "Nein. Ich erläutere medizinisch relevante Informationen und Entscheidungsfähigkeit. Den Gesprächsinhalt und die rechtlichen Voraussetzungen würdigt das Gericht."], ["check", "Was ergibt sich aus dem technischen Befund?", "Der Befund ändert die medizinische Grundbewertung nicht. Gesprochene Worte belegt die Technik nicht."]] }, "technical": { "name": "Robin Maas", "role": "IT-Mitarbeiter · sachkundiger Zeuge zum gesicherten Versionsstand", "doc": "D10", "questions": [["time", "Beweist 12:08 Uhr eine nachträgliche Fälschung?", "Nein. Das ist die technische Fertigstellung des Berichts nach dem Eingriff. Daraus allein folgt keine Täuschung."], ["view", "Was enthielt die erreichbare Ansicht?", "Das vollständige Dokument enthielt den Zusatz. Welche Worte gesprochen wurden, ergibt sich daraus nicht."]] }, "accused": { "name": "Dr. Jonas Falk", "role": "Angeklagte Person · freiwillige Einlassung", "doc": "H06", "questions": [["belief", "Was wussten oder glaubten Sie über die Freigabe?", "„Ich kannte den Vorbehalt und habe ihn vor der Operation angesprochen. Frau Seidel hat nach erneuter Erläuterung die begrenzte Entfernung für den Fall freigegeben, dass eine Naht nicht sinnvoll ist. Frau Faber war dabei.“"], ["alternatives", "Wie hätten Sie bei einer erkennbaren Einschränkung gehandelt?", "Ich kannte die Einschränkung und habe sie nach meiner Erinnerung vor der Operation erneut besprochen."]] } };
  var SOURCES = { "confidentiality": ["§ 53 StPO", "https://www.gesetze-im-internet.de/stpo/__53.html"], "auxiliary": ["§ 53a StPO", "https://www.gesetze-im-internet.de/stpo/__53a.html"], "suspicion": ["§ 152 StPO", "https://www.gesetze-im-internet.de/stpo/__152.html"], "objectivity": ["§ 160 StPO", "https://www.gesetze-im-internet.de/stpo/__160.html"], "hearing": ["§ 163a StPO", "https://www.gesetze-im-internet.de/stpo/__163a.html"], "rights": ["§ 136 StPO", "https://www.gesetze-im-internet.de/stpo/__136.html"], "files": ["§ 147 StPO", "https://www.gesetze-im-internet.de/stpo/__147.html"], "seizure": ["§ 98 StPO", "https://www.gesetze-im-internet.de/stpo/__98.html"], "protection": ["§ 97 StPO", "https://www.gesetze-im-internet.de/stpo/__97.html"], "closing": ["§ 170 StPO", "https://www.gesetze-im-internet.de/stpo/__170.html"], "minor": ["§ 153 StPO", "https://www.gesetze-im-internet.de/stpo/__153.html"], "conditions": ["§ 153a StPO", "https://www.gesetze-im-internet.de/stpo/__153a.html"], "opening": ["§ 203 StPO", "https://www.gesetze-im-internet.de/stpo/__203.html"], "questions": ["§ 240 StPO", "https://www.gesetze-im-internet.de/stpo/__240.html"], "proof": ["§ 244 StPO", "https://www.gesetze-im-internet.de/stpo/__244.html"], "documents": ["§ 249 StPO", "https://www.gesetze-im-internet.de/stpo/__249.html"], "witness": ["§ 250 StPO", "https://www.gesetze-im-internet.de/stpo/__250.html"], "lastWord": ["§ 258 StPO", "https://www.gesetze-im-internet.de/stpo/__258.html"], "conviction": ["§ 261 StPO", "https://www.gesetze-im-internet.de/stpo/__261.html"], "notice": ["§ 265 StPO", "https://www.gesetze-im-internet.de/stpo/__265.html"], "application": ["§ 230 StGB", "https://www.gesetze-im-internet.de/stgb/__230.html"], "sentence": ["§ 40 StGB", "https://www.gesetze-im-internet.de/stgb/__40.html"], "approbation": ["§ 6 BÄO", "https://www.gesetze-im-internet.de/b_o/__6.html"], "profession": ["§ 70 StGB", "https://www.gesetze-im-internet.de/stgb/__70.html"], "securing": ["§ 94 StPO", "https://www.gesetze-im-internet.de/stpo/__94.html"], "notifications": ["§§ 171–172 StPO", "https://www.gesetze-im-internet.de/stpo/__172.html"], "indictment": ["§ 200 StPO", "https://www.gesetze-im-internet.de/stpo/__200.html"], "service": ["§ 201 StPO", "https://www.gesetze-im-internet.de/stpo/__201.html"], "supplement": ["§ 202 StPO", "https://www.gesetze-im-internet.de/stpo/__202.html"], "nonopening": ["§§ 204, 210–211 StPO", "https://www.gesetze-im-internet.de/stpo/__204.html"], "trialOrder": ["§ 243 StPO", "https://www.gesetze-im-internet.de/stpo/__243.html"], "explanation": ["§ 257 StPO", "https://www.gesetze-im-internet.de/stpo/__257.html"], "punishment": ["§ 46 StGB", "https://www.gesetze-im-internet.de/stgb/__46.html"], "provisionalBan": ["§ 132a StPO", "https://www.gesetze-im-internet.de/stpo/__132a.html"], "jurisdiction": ["§§ 24–25 GVG", "https://www.gesetze-im-internet.de/gvg/__25.html"], "penalOrder": ["§§ 407–410 StPO", "https://www.gesetze-im-internet.de/stpo/__407.html"], "privateAction": ["§§ 374, 376 StPO", "https://www.gesetze-im-internet.de/stpo/__374.html"], "admissionCase": ["BGH, Beschluss 27.03.2008 · 3 StR 6/08", "https://juris.bundesgerichtshof.de/cgi-bin/rechtsprechung/document.py?Art=en&Blank=1.pdf&Datum=2008-3&Gericht=bgh&Sort=3&anz=282&nr=44318&pos=14"], "medicalCase": ["BGH, Urteil 13.08.2025 · 5 StR 55/25", "https://juris.bundesgerichtshof.de/cgi-bin/rechtsprechung/document.py?Art=pm&Blank=1&Datum=2025&Gericht=bgh&file=dokument.pdf&linked=urt&nr=142918"] };
  var TRIAL_STATIONS = [{ "id": "patient", "title": "Patientin hören", "desc": "Erinnerung, ursprünglichen Willen und Folgen prüfen.", "docs": ["D04"], "interview": "patient", "method": "Persönliche gerichtliche Vernehmung" }, { "id": "bremer", "title": "Jan Bremer hören", "desc": "Zeitliche Wahrnehmungsgrenze klären.", "docs": ["D05"], "interview": "bremer", "method": "Persönliche gerichtliche Vernehmung" }, { "id": "documents", "title": "Dokumente einführen", "desc": "Vorbehalt, Eingriff und Medikationszeit.", "docs": ["D01b", "D02", "D03"], "method": "Gerichtlich veranlasster Urkundenbeweis (§ 249 StPO)" }, { "id": "faber", "title": "Präoperatives Personal hören", "desc": "Dem konkreten entlastenden Hinweis nachgehen.", "docs": ["D08"], "interview": "faber", "method": "Persönliche gerichtliche Vernehmung" }, { "id": "expert", "title": "Sachverständige hören", "desc": "Standard, Dringlichkeit und Beweisgrenzen.", "docs": ["D09"], "method": "Mündliche sachverständige Erläuterung", "interview": "expert" }, { "id": "technical", "title": "Dokumentationsbefund klären", "desc": "Versionsstand und tatsächliche Wahrnehmung trennen.", "docs": ["D10"], "method": "Gerichtliche Vernehmung des IT-Mitarbeiters zum gesicherten Dokumentationsbefund", "interview": "technical" }, { "id": "expertSupplement", "title": "Gutachten ergänzen", "desc": "Technischen Befund medizinisch-organisatorisch einordnen.", "docs": ["D09b"], "interview": "expert", "method": "Mündliche Ergänzung der Sachverständigen nach Erläuterung des technischen Befunds" }, { "id": "keller", "title": "Aufklärende Ärztin hören", "desc": "Ursprünglichen Einwilligungsumfang absichern.", "docs": ["D15"], "interview": "keller", "method": "Persönliche gerichtliche Vernehmung" }, { "id": "statement", "title": "Frühere eigene Erklärung einführen", "desc": "Eine eigene Erklärung ist kein Polizeivernehmungsprotokoll.", "docs": ["D11"], "method": "Eigene unterschriebene Erklärung im Urkundenbeweis (§ 249 StPO)" }, { "id": "accused", "title": "Angeklagten ergänzend befragen", "desc": "Nur bei freiwilliger Einlassung. Keine Aussage erzwingen.", "docs": ["H06"], "interview": "accused", "method": "Freiwillige mündliche Einlassung nach Belehrung" }, { "id": "personal", "title": "Persönliche Verhältnisse klären", "desc": "Fallbezogene Grundlage einer möglichen Geldstrafe; kein Schuldbeweis.", "docs": ["D13"], "method": "Gerichtliche Erörterung der festgelegten persönlichen und wirtschaftlichen Verhältnisse" }];
  var VARIANTS = { "A": { "title": "Fall A", "focus": "Einwilligung und Erinnerung", "solution": "Ein späteres Gespräch wird durch eine Zeugin gestützt. Eine rechtswidrige und schuldhafte Tat lässt sich auf der vollständigen Fallgrundlage nicht sicher feststellen." } };
  function evidence(id, variant) {
    return variant === "A" && EVIDENCE[id] ? __spreadProps(__spreadValues({}, EVIDENCE[id]), { id }) : null;
  }
  function answerFor(id, q, variant) {
    var _a, _b, _c;
    return variant === "A" ? (_c = (_b = (_a = INTERVIEWS[id]) == null ? void 0 : _a.questions.find((x) => x[0] === q)) == null ? void 0 : _b[2]) != null ? _c : null : null;
  }

  // content-update/input-20261106-practice-ux/draft/demo/engine.mjs
  var SCHEMA = 2;
  var clone = (x) => JSON.parse(JSON.stringify(x));
  var uniq = (a) => [...new Set(a)];
  var action = (id) => ACTIONS.find((a) => a.id === id);
  var ended = (s) => ["closed", "judgment"].includes(s.phase);
  var judicialPhases = ["intermediate", "trial", "closing", "lastword"];
  var investigationAllowed = (s) => {
    var _a, _b, _c;
    return s.phase === "investigation" || s.phase === "intermediate" || s.phase === "conditions" && ((_b = (_a = s.conditions) == null ? void 0 : _a.origin) == null ? void 0 : _b.phase) !== "trial" && ((_c = s.conditions) == null ? void 0 : _c.status) !== "running";
  };
  var validRefs = (s, refs = [], trial = false) => uniq(refs.filter((id) => (trial ? s.introduced.map((x) => x.id) : s.known).includes(id)));
  function event(s, type, title, detail = "", refs = [], actor = "Staatsanwaltschaft", extra = {}) {
    const sourceIds = uniq(refs.filter((id) => EVIDENCE[id]));
    s.log.push(__spreadValues({
      id: "".concat(s.branchId, "-").concat(s.log.length + 1),
      number: s.log.length + 1,
      type,
      title,
      detail: String(detail),
      refs: sourceIds,
      actor,
      phase: s.phase,
      tick: s.tick,
      simulatedTime: "Fiktiver Verfahrensschritt ".concat(s.tick, "; keine reale Bearbeitungsdauer"),
      knownAtEvent: [...s.known],
      sourceTypes: sourceIds.map((id) => ({
        id,
        kind: evidence(id, s.variant).kind,
        author: evidence(id, s.variant).author,
        direct: id === "D12" ? "mittelbare Kenntnis" : id === "D00" ? "Vorwurf / Erinnerung, kein Tatnachweis" : "gemäß Quelleninhalt; Wahrnehmungsgrenzen beachten",
        limitation: evidence(id, s.variant).limit,
        read: s.read.includes(id)
      }))
    }, extra));
  }
  function feedback(s, text, kind = "info", source = null) {
    s.feedback = { text, kind, source };
    if (["error", "warning"].includes(kind)) event(s, kind === "error" ? "ACTION_REJECTED_WITH_GUIDANCE" : "LEGAL_GUIDANCE", "Rechtliche Rückmeldung", text, [], "Lernbegleitung", { ruleKind: kind === "error" ? "legalRequired" : "teachingNote", source });
    return s;
  }
  function disclose(s, ids, why, actor = "Ermittlung") {
    const fresh = ids.filter((id) => EVIDENCE[id] && !s.known.includes(id));
    s.known = uniq([...s.known, ...ids.filter((id) => EVIDENCE[id])]);
    if (fresh.length) event(s, "EVIDENCE_DISCLOSED", why, fresh.map((id) => evidence(id, s.variant).title).join(" · "), fresh, actor, { result: "Quelle verfügbar; nicht automatisch gelesen oder als wahr festgestellt" });
  }
  function complete(s, id, key = id) {
    s.completed = uniq([...s.completed, key]);
  }
  function reviseKey(s, id) {
    return id === "A12" && s.known.includes("D09") && s.known.includes("D10") ? "A12:erg" : id;
  }
  function initialState(variant = "A", group = "", settings = {}) {
    if (!["A", "B", "C"].includes(variant)) throw new Error("Unbekannte Fallvariante.");
    const s = {
      schemaVersion: SCHEMA,
      caseId: CASE_ID,
      sessionId: "s-".concat(Date.now().toString(36), "-").concat(Math.random().toString(36).slice(2, 8)),
      variant,
      group: String(group).slice(0, 80),
      settings: __spreadValues({ minutes: 90, hints: true, judgeView: true }, settings),
      branchId: "zweig-1",
      parentBranchId: null,
      mode: "ordinary",
      phase: "intake",
      tick: 0,
      known: ["D00", "D01a"],
      read: [],
      completed: [],
      answers: [],
      jobs: [],
      log: [],
      release: false,
      defenseOpportunity: false,
      defenseState: "none",
      defenseRequest: false,
      defenseRequestResolved: false,
      introduced: [],
      trialStations: [],
      trialStage: 0,
      activeStation: null,
      closedStations: [],
      motions: [],
      noticeIssued: false,
      noticePending: false,
      courtStatus: null,
      conditions: null,
      minor: null,
      decision: null,
      plea: null,
      judgment: null,
      archive: [],
      snapshots: [],
      notes: {},
      feedback: null,
      lastWord: false,
      closingStep: null,
      courtRequested: null,
      indictment: null
    };
    event(s, "CASE_STARTED", "Eine neue Strafakte", "Anzeige vom 6. Oktober 2026 liegt vor. Alle Personen und Unterlagen sind erfunden.", ["D00", "D01a"], "Posteingang");
    s.traceBase = clone(s);
    s.journal = [];
    return s;
  }
  function facts(s, trial = false) {
    return new Set((trial ? s.introduced.map((x) => x.id) : s.known).flatMap((id) => {
      var _a;
      return ((_a = evidence(id, s.variant)) == null ? void 0 : _a.claims) || [];
    }));
  }
  function dispositionFacts(s, origin) {
    return facts(s, !!origin && ["trial", "closing", "lastword"].includes(origin.phase));
  }
  function faberKnown(s) {
    return facts(s).has("faberIdentified");
  }
  function defenseOpen(s) {
    return s.defenseRequest && !s.known.includes("D08");
  }
  function resolveDefense(s) {
    if (s.defenseRequest && s.known.includes("D08") && !s.defenseRequestResolved) {
      s.defenseRequestResolved = true;
      event(s, "DEFENSE_REQUEST_RESOLVED", "Entlastungsbeweisantrag behandelt", "Faber wurde zu dem beantragten Gespräch gehört. Bereits erhobene Ergebnisse genügen; keine künstliche identische Doppelvernehmung.", ["D06b", "D08"], "Staatsanwaltschaft");
    }
  }
  function actionStatus(s, id) {
    var _a;
    const a = action(id);
    if (!a) return { status: "unavailable", reason: "Unbekannte Aktion." };
    if (["A01", "A16", "A17"].includes(id)) return { status: "available" };
    const key = reviseKey(s, id);
    if (s.jobs.some((j) => j.key === key)) return { status: "pending", reason: id === "A05" ? "Anhörung veranlasst; angemessene Stellungnahmegelegenheit läuft" : "Auftrag ausstehend" };
    if (s.completed.includes(key) || ((_a = a.docs) == null ? void 0 : _a.length) && a.docs.every((d) => s.known.includes(d)) && !(id === "A12" && key === "A12:erg")) return { status: "completed", reason: "In der Akte nachlesbar" };
    if (!investigationAllowed(s)) return { status: "blocked", reason: ended(s) ? "Der Zweig ist abgeschlossen. In einem neuen Übungszweig fortsetzen." : "Hier entscheidet das Gericht über weitere Beweiserhebungen. Zur gerichtlichen Beweisaufnahme zurückkehren.", repair: "court" };
    if (id === "A11" && !s.answers.includes("invest:patient:people") && !s.known.includes("D12")) return { status: "blocked", reason: "Die Begleitperson ist noch nicht konkret identifiziert. Bei der Patientin nachfragen oder die Polizei gezielt zur Identifizierung und Befragung beauftragen.", repair: "A03" };
    if (a.requires === "faber" && !faberKnown(s)) return { status: "blocked", reason: "Zuerst das präoperative Personal identifizieren. Die Ermittlungsrichtung bleibt frei wählbar.", repair: "A09" };
    if (a.requires === "defense" && !s.defenseOpportunity) return { status: "blocked", reason: "Zunächst Vorwurf, Belehrung und tatsächlich eingeräumte Gelegenheit zur Äußerung klären.", repair: "A05" };
    return { status: "available" };
  }
  function flush(s) {
    let progress = true;
    while (progress) {
      progress = false;
      for (const j of [...s.jobs]) {
        if (j.due > s.tick) continue;
        if (j.waitFor.some((d) => !s.known.includes(d))) {
          j.waiting = true;
          continue;
        }
        disclose(s, j.docs, "".concat(j.title, ": Rücklauf liegt vor"), j.actor);
        complete(s, j.action, j.key);
        if (j.action === "A05") {
          s.defenseOpportunity = true;
          s.defenseState = "silenceAfterOpportunity";
          event(s, "DEFENSE_RIGHT_EXERCISED", "Angemessene Gelegenheit wahrgenommen", "Akteneinsicht ist im Lehrfall gewährt; nach eingeräumter Stellungnahmezeit bleibt die Verteidigung zunächst beim Schweigen. Die Einladung allein genügte vorher nicht.", ["D06"], "Verteidigung");
        }
        event(s, "JOB_COMPLETED", "Auftrag erledigt", j.title, j.docs, j.actor, { jobId: j.id, status: "completed", question: j.question || j.title, grounds: j.grounds || [] });
        s.jobs = s.jobs.filter((x) => x.id !== j.id);
        progress = true;
      }
    }
    resolveDefense(s);
  }
  function job(s, a, docs = a.docs, key = reviseKey(s, a.id), actor = "Beauftragte Stelle", opts = {}) {
    if (s.jobs.some((j2) => j2.key === key) || s.completed.includes(key)) return;
    const waitFor = key === "A12:erg" ? ["D09", "D10"] : a.waitFor || [];
    const j = { id: "job-".concat(s.branchId, "-").concat(s.tick, "-").concat(a.id), action: a.id, key, title: a.title, docs, due: s.tick + 1, waitFor: [...waitFor], actor, waiting: false, question: opts.question || a.desc, grounds: validRefs(s, opts.refs || s.known), input: opts };
    s.jobs.push(j);
    event(s, "JOB_CREATED", "Arbeitsauftrag erteilt", "".concat(a.title, ". Fragestellung: ").concat(j.question), [], actor, { jobId: j.id, status: "pending", question: j.question, grounds: j.grounds });
  }
  function readiness(s) {
    const items = [];
    if (!s.defenseOpportunity) items.push({ kind: "legal", text: s.defenseState === "invited" ? "Die Einladung ist versandt; die angemessene Stellungnahmegelegenheit läuft noch. Vor Anklage Rücklauf behandeln." : "Vor Anklage ist die Beschuldigtenanhörung/Äußerungsmöglichkeit zu beachten. Die gesetzliche Einstellungsausnahme bleibt bestehen.", source: "hearing", action: "A05" });
    if (!defenseOpen(s) && faberKnown(s) && !s.known.includes("D08")) items.push({ kind: "legal", text: "Eine konkret bekannte Gesprächszeugin ist noch nicht gehört. Diesen erheblichen Ansatz vor belastendem Abschluss objektiv aufklären.", source: "objectivity", action: "A10" });
    if (defenseOpen(s)) items.push({ kind: "legal", text: "Der erhebliche Entlastungsbeweisantrag zu Faber ist noch offen.", source: "hearing", action: "A10" });
    if (!s.known.includes("D01b")) items.push({ kind: "recommendation", text: "Der vollständige Freigabebogen liegt noch nicht vor.", action: "A04" });
    if (!s.known.includes("D08")) items.push({ kind: "recommendation", text: "Die präoperative Gesprächssituation ist noch weiter aufklärbar.", action: faberKnown(s) ? "A10" : "A09" });
    if (!s.known.includes("D09")) items.push({ kind: "recommendation", text: "Die medizinischen Fragen sind noch nicht sachverständig eingeordnet.", action: "A12" });
    if (s.jobs.length) items.push({ kind: "recommendation", text: "".concat(s.jobs.length, " Rücklauf/Rückläufe stehen noch aus.") });
    return items;
  }
  function performTransition(input2, id, opts = {}) {
    var _a, _b, _c, _d;
    const s = clone(input2);
    s.feedback = null;
    const a = action(id);
    if (!a) return feedback(s, "Diese Aktion ist nicht bekannt.", "error");
    if (["A01", "A16", "A17"].includes(id)) return s;
    const status = actionStatus(s, id);
    if (status.status === "completed") return feedback(s, "Dieses Ergebnis bleibt in der Akte nachlesbar. Ein identischer Auftrag erzeugt keine neue Quelle.");
    if (status.status === "pending") return feedback(s, "Der Auftrag läuft. Andere Ermittlungen bleiben möglich; über Rückläufe die fiktive Bearbeitung fortsetzen.");
    if (status.status === "blocked" && !(id === "A11" && opts.delegated && investigationAllowed(s))) return feedback(s, status.reason, "warning");
    if (a.release && !s.release) return feedback(s, "Für diesen freiwilligen Weg zunächst die konkret begrenzte Schweigepflichtentbindung klären. Beschlagnahme ist ein gesondert zu prüfender Weg.", "release", "confidentiality");
    if (id === "A18" && !((_a = opts.purpose) == null ? void 0 : _a.trim())) return feedback(s, "Den Bezug zur Auflagenprüfung oder möglichen Strafzumessung benennen. Private Verhältnisse sind kein allgemeiner Ermittlungsspielplatz.", "purpose");
    s.tick++;
    event(s, "ACTION_REQUESTED", a.title, opts.question || opts.purpose || a.desc, [], s.phase === "intermediate" ? "Gericht / ergänzende Sachaufklärung" : "Staatsanwaltschaft", { actionId: id, grounds: validRefs(s, opts.refs || s.known), input: opts });
    if (id === "A02") {
      complete(s, id);
      event(s, "LEGAL_CHECK", "Anfangsverdacht und Strafantrag", "Konkrete Anhaltspunkte rechtfertigen hier Ermittlungen. Strafantrag ist ausdrücklich gestellt. Noch kein Tatnachweis.", ["D00"]);
      return feedback(s, "Anfangsverdacht, hinreichenden Tatverdacht und gerichtliche Überzeugung unterscheiden.", "info", "suspicion");
    }
    if (id === "A06") return s;
    if (id === "A07") {
      complete(s, id);
      event(s, "NEGATIVE_RESULT", "Polizeilicher Statusbericht", "Neben den bereits in der Akte dokumentierten Rückläufen liegen keine weiteren unaufgeforderten eigenen Erkenntnisse vor. Bitte konkrete Ermittlungsaufträge benennen.", [], "Polizei");
      return feedback(s, "Begrenzter Statusbericht, keine Sackgasse. Die anderen Ermittlungen bleiben erreichbar.");
    }
    if (id === "A15") {
      if (opts.scope !== "limited" || !((_b = opts.reason) == null ? void 0 : _b.trim())) return feedback(s, "Antrag auf die betroffene Behandlung, erforderliche Originaldaten, Zweck und Zeitraum begrenzen. Ein enger Antrag oder freiwillige Übermittlung bleiben möglich.", "error", "seizure");
      if (opts.route === "urgent") return feedback(s, "Die Fallakte enthält keine konkrete drohende Beweisvernichtung, die Gefahr im Verzug tragen würde. Die Seminarzeit ersetzt diese Voraussetzung nicht. Gerichtlichen Antrag oder freiwilligen Weg wählen.", "error", "seizure");
      if (!["court", "voluntary"].includes(opts.route)) return feedback(s, "Einen gesetzlich passenden Sicherungsweg wählen.", "error", "seizure");
      if (opts.route === "voluntary" && !s.release) return feedback(s, "Für die freiwillige Übermittlung zuerst die fallbezogene Entbindung dokumentieren.", "release", "confidentiality");
      const actor = opts.route === "court" ? "Ermittlungsgericht / Polizei" : "Klinikarchiv";
      event(s, "SECURING_REVIEW", "Schutz und Umfang geprüft", "Im gesetzten Fall: Unterlagen allein zu Mara Seidels Kniebehandlung; Beweisbedeutung des Vorbehalts; kein Zugriff auf fremde Behandlungen. § 97 schützt nicht pauschal jede ärztliche Akte gegen Ermittlungen wegen einer Tat des Arztes. Gewahrsam, Schutzrichtung und Ausnahmen bleiben zu prüfen. Der enge rechtmäßige Zugriff ist hier Fallannahme.", [], actor, { source: "protection" });
      event(s, "SECURING_APPROVED", opts.route === "court" ? "Gericht ordnet begrenzte Beschlagnahme an" : "Freiwillige Sicherstellung", "Zweck: " + opts.reason, [], actor);
      job(s, __spreadProps(__spreadValues({}, a), { waitFor: [] }), ["D01b", "D02", "D03"], "A15", actor, opts);
      return feedback(s, "Die begrenzte Sicherung ist veranlasst. Ein freiwilliger Versuch ist keine ausnahmslose Vorbedingung eines richterlichen Antrags.");
    }
    if (id === "A05") {
      s.defenseState = "invited";
      event(s, "DEFENSE_OPPORTUNITY_OFFERED", "Beschuldigtenanhörung vorbereitet", "Vorwurf mitgeteilt, Belehrung über Schweigen, Verteidigung und Entlastungsbeweise; Akteneinsichtsgesuch und angemessene Stellungnahmegelegenheit werden behandelt. Form: ".concat(opts.form || "ordnungsgemäße Ladung zur Vernehmung mit Verteidigungsmöglichkeit", ". Keine allgemeine Erscheinenspflicht auf bloße Polizeiladung."), [], "Staatsanwaltschaft");
      job(s, a, ["D06"], "A05", "Verteidigung", opts);
      return feedback(s, "Noch keine abgeschlossene Anhörung: die tatsächlich eingeräumte Gelegenheit und den Rücklauf abwarten. Andere Ermittlungen sind möglich.", "info", "hearing");
    }
    if (id === "A12" && ((_c = opts.questions) == null ? void 0 : _c.includes("guilt"))) return feedback(s, "Die Sachverständige entscheidet nicht über Schuld. Medizinische Fragen zu Standard, Dringlichkeit, Folgen oder Entscheidungsfähigkeit auswählen.", "error", "proof");
    if (opts.delegated || a.type === "job") {
      const key = reviseKey(s, id), docs = key === "A12:erg" ? ["D09b"] : a.docs;
      job(s, a, docs, key, opts.delegated ? "Polizei" : id === "A12" ? "Sachverständige" : id === "A13" ? "IT-Sachaufklärung" : "Polizei / Klinik", opts);
      return feedback(s, ((_d = a.waitFor) == null ? void 0 : _d.some((d) => !s.known.includes(d))) ? "Auftrag erteilt; Ergebnis wartet auf die nötigen Unterlagen. Andere Schritte bleiben möglich." : "Auftrag erteilt; keine reale Wartezeit. Über Rückläufe die simulierte Bearbeitung fortsetzen.");
    }
    disclose(s, a.docs || [], a.title, a.interview ? "Vernehmung / Korrespondenz" : "Verfahrensakte");
    complete(s, id);
    resolveDefense(s);
    return feedback(s, "Ergebnis und seine Grenzen wurden der Akte hinzugefügt.");
  }
  function originOf(s) {
    return { phase: s.phase, trialStage: s.trialStage, courtStatus: s.courtStatus, closingStep: s.closingStep };
  }
  function restoreOrigin(s, origin) {
    s.phase = (origin == null ? void 0 : origin.phase) || "investigation";
    s.trialStage = (origin == null ? void 0 : origin.trialStage) || 0;
    s.courtStatus = (origin == null ? void 0 : origin.courtStatus) || null;
    s.closingStep = (origin == null ? void 0 : origin.closingStep) || null;
  }
  function snapshot(s, kind, basis, p) {
    const snap = { id: "entscheidung-".concat(s.snapshots.length + 1), branchId: s.branchId, phase: s.phase, kind, basis, reason: p.reason || "", counter: p.counter || "", uncertainty: p.uncertainty || "", refs: validRefs(s, p.refs || []), known: [...s.known], read: [...s.read], introduced: clone(s.introduced), warnings: readiness(s), tick: s.tick };
    s.snapshots.push(snap);
    return snap;
  }
  function assessment(s, basis) {
    const f = facts(s);
    if (basis !== "170II") return "Geringe hypothetische Schuld und öffentliches Verfolgungsinteresse sind eigenständig zu prüfen. Diese modellierte Ermessensentscheidung ist nicht zwingend.";
    if (f.has("knownRefusalAdmission") && f.has("noEmergency")) return "Der bekannte Belastungskern spricht deutlich gegen diese Einstellung. Kein zusätzlicher Dauerschaden ist kein ausreichender Einstellungsgrund: bereits die Gewebeentfernung ist ein Eingriff.";
    if (f.has("laterConsentWitness")) return f.has("medicationTime") ? "Die entlastende Gesprächsschilderung passt zur dokumentierten Zeit. § 170 Abs. 2 ist auf der vollständigen Fallgrundlage der vorgesehene Regelausgang; kritisch würdigen." : "Erhebliche Entlastung liegt vor; der Abgleich mit dem Anästhesieprotokoll fehlt aber noch. Frühe Entscheidung und offene Sachaufklärung getrennt besprechen.";
    return "Diese Entscheidung wird ex ante anhand der damaligen verfügbaren Quellen besprochen. Es bestehen noch erkennbare Ermittlungsansätze; keine Bewertung mit unentdeckter Fallwahrheit.";
  }
  function eligibleFacts(f) {
    return f.has("intervention") && f.has("mistakenBeliefAdmission") && f.has("avoidableCheck") && f.has("shortViewError") && f.has("noEmergency");
  }
  function decide(s, p) {
    var _a, _b, _c, _d;
    if (!["170II", "153", "153a"].includes(p.basis)) return feedback(s, "Rechtsgrundlage auswählen.", "error");
    if (((_a = s.conditions) == null ? void 0 : _a.status) === "running" || ((_b = s.conditions) == null ? void 0 : _b.activePlan)) return feedback(s, "Eine wirksame vorläufige Erledigung läuft. Erfüllung, Änderung oder Fristproblem gesetzeskonform behandeln.", "error", "conditions");
    const origin = ((_c = s.conditions) == null ? void 0 : _c.origin) || ((_d = s.minor) == null ? void 0 : _d.origin) || originOf(s), judicial = judicialPhases.includes(origin.phase);
    if (judicial && p.basis === "170II") return feedback(s, "Nach Anklage kann die Staatsanwaltschaft das gerichtliche Verfahren nicht einseitig nach § 170 Abs. 2 beenden. Gerichtliche Entscheidung oder Einstellung prüfen.", "error", "closing");
    if (!judicial && !["investigation", "conditions", "minor"].includes(s.phase)) return feedback(s, "Zunächst den passenden Verfahrensabschnitt öffnen.", "error");
    if (p.basis === "153a") {
      s.conditions = { version: 0, basis: judicial ? "153aII" : "153aI", items: [], status: "draft", reason: p.reason || "", counter: p.counter || "", refs: validRefs(s, p.refs || []), consents: { accused: "offen", court: "offen", prosecution: "offen" }, origin, history: [] };
      s.phase = "conditions";
      event(s, "DECISION_PROPOSED", "Auflagenweg prüfen", "Voraussetzungen, Gesamtpaket und erforderliche Zustimmungen sind offen.");
      return s;
    }
    if (p.basis === "153") {
      s.minor = { basis: judicial ? "153II" : "153I", origin, reason: p.reason || "", counter: p.counter || "", uncertainty: p.uncertainty || "", refs: validRefs(s, p.refs || []), status: "review", consents: { court: "offen", accused: judicial ? "offen" : "nicht erforderlich", prosecution: judicial ? "offen" : "entscheidende Stelle" } };
      s.phase = "minor";
      event(s, "DECISION_PROPOSED", "Einstellung ohne Auflagen prüfen", "§ 153: geringe hypothetische Schuld, kein öffentliches Verfolgungsinteresse; Zuständigkeit und Zustimmung gesondert.");
      return s;
    }
    const snap = snapshot(s, "Einstellung", "170II", p);
    s.decision = { kind: "Einstellung nach § 170 Abs. 2", basis: "170II", reason: p.reason || "", counter: p.counter || "", uncertainty: p.uncertainty || "", refs: snap.refs, feedback: assessment(s, "170II"), exAnteWarnings: snap.warnings, snapshotId: snap.id };
    s.phase = "closed";
    event(s, "DECISION_RECORDED", s.decision.kind, p.reason || "Keine eigene Begründung dokumentiert.", snap.refs);
    event(s, "NOTIFICATIONS_PREPARED", "Benachrichtigungen im Lehrfall", "Mara Seidel erhält als antragstellende Verletzte einen begründeten Bescheid mit einschlägigen Hinweisen. Dr. Falk wird nach § 170 Abs. 2 bei den dort genannten Voraussetzungen benachrichtigt; nach erfolgter Anhörung ist dies hier der Fall. Kein allgemeines Versprechen eines Klageerzwingungsverfahrens bei §§ 223/229.", [], "Staatsanwaltschaft", { source: "notifications" });
    return s;
  }
  function savePlan(s, p) {
    var _a;
    if (s.phase !== "conditions" || !s.conditions) return feedback(s, "Zuerst den Auflagenweg in der passenden Phase prüfen.", "error", "conditions");
    const items = p.items || [];
    if (!items.length || items.some((x) => !["P01", "P02", "P03"].includes(x.id))) return feedback(s, "Mindestens ein hier passendes bestimmtes Auflagenmodul auswählen.", "error", "conditions");
    if (new Set(items.map((x) => x.id)).size !== items.length || items.some((x) => x.id !== "P03" && (!Number.isSafeInteger(Number(x.amount)) || Number(x.amount) <= 0))) return feedback(s, "Ganze positive Eurobeträge verwenden und Module nicht doppelt buchen.", "error");
    if (items.some((x) => x.id === "P01" && x.recipient !== void 0 && !String(x.recipient).trim())) return feedback(s, "Für die Geldzahlung einen konkreten zulässigen Empfänger angeben.", "error", "conditions");
    const months = Number((_a = p.months) != null ? _a : 3);
    if (!Number.isInteger(months) || months < 1 || months > 6) return feedback(s, "Die Grundfrist dieser Module muss zwischen einem und sechs Monaten liegen. Die gesetzlich mögliche einmalige Verlängerung wird gesondert behandelt.", "error", "conditions");
    const old = s.conditions, active = old.status === "running" ? clone(__spreadProps(__spreadValues({}, old), { activePlan: null })) : old.activePlan || null;
    const history = old.version ? [...old.history || [], { version: old.version, items: clone(old.items), consents: clone(old.consents), status: old.status }] : [];
    s.conditions = { version: old.version + 1, history, basis: old.basis, origin: old.origin, reason: p.reason || "", counter: p.counter || "", refs: validRefs(s, p.refs || old.refs || []), items: items.map((x) => {
      var _a2;
      return { id: x.id, amount: x.id === "P03" ? null : Number(x.amount), recipient: x.id === "P01" ? String((_a2 = x.recipient) != null ? _a2 : "Staatskasse Lindenhafen (fiktiv)").trim() : x.id === "P02" ? "Mara Seidel" : null, done: false };
    }), status: "draft", consents: { accused: "offen", court: "offen", prosecution: "offen" }, deadlineMonths: months, extensions: (active == null ? void 0 : active.extensions) || 0, activePlan: active };
    event(s, "CONDITIONS_PLAN_REVISED", "Auflagenplan ".concat(s.conditions.version, " vorgeschlagen"), s.conditions.items.map((x) => "".concat(x.id).concat(x.amount ? " · " + x.amount + " €" : "").concat(x.recipient ? " an " + x.recipient : "")).join(" + ") + ". Frist: ".concat(months, " Monate. Erforderliche Zustimmungen neu prüfen; ").concat(active ? "die bisher wirksame Regelung bleibt bis zur genehmigten Änderung bestehen." : "noch keine Anordnung."));
    return feedback(s, "Vorschlag gespeichert. Die Zustimmung bezieht sich auf genau dieses Paket.");
  }
  function consent(s, p) {
    const plan = s.conditions;
    if (s.phase !== "conditions" || !(plan == null ? void 0 : plan.items.length)) return feedback(s, "Zunächst einen konkreten Auflagenplan speichern.", "error");
    if (plan.status === "running") return s;
    const needed = plan.basis === "153aII" ? ["accused", "court", "prosecution"] : ["accused", "court"];
    if (!needed.includes(p.actor) || plan.consents[p.actor] === "zugestimmt") return s;
    let answer = "zugestimmt", reason = "Zustimmung zur konkret bezeichneten fiktiven Planversion.";
    if (p.response === "refuse") {
      answer = "abgelehnt";
      reason = "Für diesen gesondert bezeichneten Verfahrensversuch wird eine verweigerte Zustimmung simuliert. Die Falltatsachen und ihre Beweismittel bleiben gleich.";
    } else if (p.actor === "accused" && evidence("D14", s.variant).body.includes("derzeit nicht")) {
      disclose(s, ["D14"], "Rückmeldung zur Ausgleichsbereitschaft", "Verteidigung");
      answer = "abgelehnt";
      reason = "Dr. Falk möchte die Einwilligungsfrage klären lassen und akzeptiert derzeit keine Auflagen. Ablehnung ist kein Schuldbeweis.";
    }
    if (answer === "zugestimmt" && p.actor === "court") {
      const f = dispositionFacts(s, plan.origin), sum = plan.items.reduce((a, x) => a + (x.amount || 0), 0);
      if (!eligibleFacts(f) || !s.known.includes("D08") && faberKnown(s)) {
        answer = "Klärungsbedarf";
        reason = f.has("knownRefusalAdmission") ? "Der bewusst übergangene bekannte Vorbehalt spricht im gesetzten Fall gegen diese Erledigung. Kein allgemeines gesetzliches Verbot jeder Einstellung wegen ärztlicher Körperverletzung." : "Die derzeit tragfähige Verdachtslage und die Erledigungsvoraussetzungen sind noch nicht ausreichend eingeordnet. Eine Zahlung ersetzt keine Entlastungsaufklärung.";
      } else if (sum > 2e3) {
        answer = "Änderungsvorschlag";
        reason = "Die Gerichtssimulation verlangt ein geringeres und begründetes Gesamtpaket. 2.000 Euro sind keine gesetzliche Grenze, sondern nur die gesetzte Verhandlungsposition.";
      } else if (plan.items.some((x) => x.id === "P03") && !f.has("settlementWillingness") && !s.known.includes("D14")) {
        answer = "Klärungsbedarf";
        reason = "Für den Ausgleich im Lehrfall zuerst die fallbezogene Bereitschaft klären; Vergeben oder Erfolg dürfen nicht erzwungen werden.";
      }
    }
    plan.consents[p.actor] = answer;
    plan.status = "awaitingConsent";
    event(s, answer === "zugestimmt" ? "CONSENT_RECEIVED" : "CONSENT_REFUSED", "".concat(p.actor === "accused" ? "Beschuldigter" : p.actor === "court" ? "Gericht" : "Staatsanwaltschaft", ": ").concat(answer), "Planversion ".concat(plan.version, ". ").concat(reason), [], p.actor === "court" ? "Gericht" : p.actor === "accused" ? "Verteidigung" : "Staatsanwaltschaft");
    if (needed.every((k) => plan.consents[k] === "zugestimmt")) {
      const old = plan.activePlan;
      if (old) {
        for (const x of plan.items) {
          const prev = old.items.find((y) => y.id === x.id && y.recipient === x.recipient);
          if (prev == null ? void 0 : prev.done) {
            if (x.amount) {
              x.credited = prev.amount;
              x.done = x.amount <= prev.amount;
            } else x.done = true;
          }
        }
        plan.activePlan = null;
      }
      plan.status = "running";
      snapshot(s, "Vorläufige Erledigung", plan.basis, plan);
      event(s, "PROVISIONAL_DISPOSITION_STARTED", old ? "Geänderter Auflagenplan wirksam" : "Vorläufige Erledigung nach § 153a", "Plan ".concat(plan.version, "; Frist ").concat(plan.deadlineMonths, " Monate. Noch kein endgültiger Abschluss."), [], plan.basis === "153aII" ? "Gericht" : "Staatsanwaltschaft");
      if (plan.items.every((x) => x.done)) return finishPlan(s);
      return feedback(s, "Die erforderlichen Zustimmungen liegen vor. Erfüllung und Frist jetzt überwachen.", "info", "conditions");
    }
    return feedback(s, reason, answer === "zugestimmt" ? "info" : "warning", "conditions");
  }
  function finishPlan(s) {
    const plan = s.conditions;
    if (!plan.items.every((x) => x.done)) return s;
    plan.status = "fulfilled";
    s.decision = { kind: "Erledigung nach Auflagenerfüllung", basis: plan.basis, reason: plan.reason, refs: plan.refs || [], counter: plan.counter || "" };
    snapshot(s, "Erledigung", plan.basis, plan);
    s.phase = "closed";
    event(s, "DISPOSITION_CLOSED", "Auflagen vollständig erfüllt", "Die Tat kann nach der gesetzlichen Erfüllungswirkung nicht mehr als Vergehen verfolgt werden. Kein Schuldspruch, keine Geldstrafe.", [], plan.basis === "153aII" ? "Gericht" : "Staatsanwaltschaft");
    return s;
  }
  function introduce(s, ids, method, stationId) {
    disclose(s, ids, "Gerichtlich erhobenes Material", "Gericht");
    for (const id of ids) if (!s.introduced.some((x) => x.id === id)) s.introduced.push({ id, method, event: s.log.length + 1, station: stationId, scope: [...evidence(id, s.variant).claims], objections: [], tick: s.tick });
    event(s, "TRIAL_EVIDENCE_INTRODUCED", method, ids.map((id) => evidence(id, s.variant).title).join(" · "), ids, "Gericht", { method, station: stationId, status: "introduced" });
  }
  function endStation(s) {
    if (s.activeStation) {
      s.closedStations = uniq([...s.closedStations, s.activeStation]);
      event(s, "WITNESS_DISMISSED", "Beweisstation beendet", "Weitere eigene Fragen sind geschlossen; eine erneute Vernehmung kann mit konkretem Anlass beantragt werden.", [], "Vorsitz");
      s.activeStation = null;
    }
  }
  function station(s, p) {
    if (s.phase !== "trial" || s.trialStage !== 3) return feedback(s, "Beweiserhebung gehört in die laufende gerichtliche Beweisaufnahme.", "error");
    const st = TRIAL_STATIONS.find((x) => x.id === p.station);
    if (!st) return feedback(s, "Unbekannte Beweisstation.", "error");
    if (s.closedStations.includes(st.id) && !p.recall && s.courtRequested !== st.id) return feedback(s, "Diese Vernehmung ist beendet. Zum Nachlesen bleibt die Quelle verfügbar; für neue Fragen einen begründeten Antrag auf erneute Vernehmung stellen.", "warning", "proof");
    if (["bremer", "faber", "keller", "expert", "expertSupplement", "technical", "documents"].includes(st.id) && !s.release) return feedback(s, "Das Gericht klärt hier zunächst die fallbezogene Entbindung für die geschützten Behandlungsinformationen.", "release", "confidentiality");
    if (st.id === "faber" && !faberKnown(s) && !s.introduced.some((x) => x.id === "D05")) {
      s.defenseRequest = true;
      disclose(s, ["D06b"], "Verteidigung benennt eine präoperative Gesprächszeugin", "Verteidigung");
    }
    if (st.id === "expertSupplement" && (!s.trialStations.includes("technical") || !s.trialStations.includes("expert"))) return feedback(s, "Für diese Ergänzung müssen Grundgutachten und technischer Befund zunächst in der Hauptverhandlung erörtert sein.", "warning", "proof");
    if (st.id === "statement" && !s.known.includes("D11")) return feedback(s, "Eine frühere eigene schriftliche Erklärung liegt in diesem Lernzweig nicht vor. Die freiwillige mündliche Einlassung ist eine andere Quelle; keine Urkunde erfinden.", "warning", "documents");
    if (st.id === "expert" && ["D01b", "D02"].some((id) => !s.known.includes(id))) {
      disclose(s, ["D01b", "D02"], "Gericht stellt der Sachverständigen die erforderlichen Grundunterlagen zur Verfügung", "Gericht");
      event(s, "COURT_MATERIAL_PREPARED", "Begutachtungsgrundlage geklärt", "Die Unterlagen sind nun verfügbar; ihre förmliche Einführung als Urkunden erfolgt weiterhin gesondert.", [], "Gericht");
    }
    if (s.activeStation !== st.id) endStation(s);
    s.activeStation = st.id;
    s.closedStations = s.closedStations.filter((x) => x !== st.id);
    if (!s.trialStations.includes(st.id)) {
      introduce(s, st.docs, st.method, st.id);
      s.trialStations.push(st.id);
    } else event(s, "WITNESS_RECALLED", "Gerichtlich zugelassene ergänzende Befragung", p.fact || st.title, st.docs, "Gericht");
    if (s.courtRequested === st.id) s.courtRequested = null;
    event(s, "EXPLANATION_OPPORTUNITY", "Gelegenheit zur Erklärung", "Die angeklagte Person wird befragt, ob sie sich zum Ergebnis erklären will. Staatsanwaltschaft und Verteidigung können auf Verlangen Erklärungen abgeben. Kein vorgezogenes Plädoyer.", [], "Vorsitz", { source: "explanation" });
    return feedback(s, "Gerichtliche Beweiserhebung dokumentiert. Zulässige Nachfragen und eine Erklärung bleiben möglich.");
  }
  function judge(s) {
    const f = facts(s, true);
    if (f.has("knownRefusalAdmission") && f.has("restriction") && f.has("intervention") && f.has("noEmergency")) return { kind: "conviction", delict: "223", title: "Verurteilung wegen Körperverletzung", reason: "Der Vorbehalt und Eingriff sind Gegenstand der Hauptverhandlung. Die freiwillige Einlassung bestätigt Kenntnis und bewusstes Überschreiten. Eine rechtfertigende Notlage trägt der Beweisstoff nicht. Das Gericht folgt nicht automatisch dem Antrag der Staatsanwaltschaft.", example: "Fiktive gerichtliche Beispielentscheidung: 60 Tagessätze zu 120 Euro = 7.200 Euro. Kein Straftarif; andere begründete Strafzumessung bleibt diskutierbar." };
    if (f.has("mistakenBeliefAdmission") && f.has("avoidableCheck") && f.has("shortViewError") && f.has("intervention")) return { kind: "conviction", delict: "229", title: "Verurteilung wegen fahrlässiger Körperverletzung", reason: "Der eingeführte Beweisstoff trägt im gesetzten Fall den vermeidbaren Irrtum über den Freigabeumfang. Der mögliche vollständige Dokumentenabgleich und die individuelle Vorwerfbarkeit wurden erörtert. Dies ist die modellierte Fallbewertung, kein allgemeiner Schluss von Softwarefehler auf Strafbarkeit.", example: "Fiktive gerichtliche Beispielentscheidung: 30 Tagessätze zu 120 Euro = 3.600 Euro. Keine einzig richtige Strafzahl." };
    return { kind: "acquittal", title: "Freispruch", reason: f.has("laterConsentWitness") ? "Faber schildert eine begrenzte Freigabe vor der Medikation. Der ursprüngliche Vorbehalt allein widerlegt diese spätere Einwilligung nicht. Eine rechtswidrige und schuldhafte Tat ist nach kritischer Würdigung nicht mit der erforderlichen Sicherheit feststellbar." : "Der eingeführte Beweisstoff trägt die erforderliche Überzeugung von einer rechtswidrigen und schuldhaften Tat nicht.", example: "Freispruch ist eine gerichtliche Entscheidung und von Einstellung sowie Nichteröffnung zu unterscheiden." };
  }
  function commandTransition(input2, type, p = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
    const s = clone(input2);
    s.feedback = null;
    if (ended(s) && !["read", "fork", "note", "debrief"].includes(type)) {
      s.feedback = { text: "Der Abschluss bleibt unverändert. Für weitere Schritte einen neuen deutlich bezeichneten Übungszweig öffnen.", kind: "error", source: null };
      return s;
    }
    if (type === "start") {
      if (s.phase !== "intake") return s;
      s.phase = "investigation";
      complete(s, "A01");
      event(s, "CASE_ACCEPTED", "Ermittlungen aufgenommen", "Konkrete Anhaltspunkte und ausdrücklicher Strafantrag sind gegeben. Keine Schuldentscheidung.", ["D00"]);
      return s;
    }
    if (type === "read") {
      if (EVIDENCE[p.id] && s.known.includes(p.id) && !s.read.includes(p.id)) {
        s.read.push(p.id);
        if (!ended(s)) event(s, "DOCUMENT_OPENED", "Quelle geöffnet", evidence(p.id, s.variant).title, [p.id], "Lerngruppe");
      }
      return s;
    }
    if (type === "note") {
      const key = String(p.key || "reflection").slice(0, 120);
      s.notes[key] = String(p.text || "").slice(0, 12e3);
      return s;
    }
    if (type === "debrief") {
      event(s, "DEBRIEF_OPENED", "Nachbesprechung geöffnet", "Damals verfügbare und später erhobene Quellen getrennt betrachten.", [], "Lerngruppe");
      return s;
    }
    if (type === "release") {
      s.release = true;
      event(s, "RELEASE", "Begrenzte Entbindung dokumentiert", "Mara Seidel entbindet das behandelnde Team und die mitwirkenden Personen hinsichtlich ihrer eigenen Kniebehandlung und Aufklärungsfragen. Keine Freigabe fremder Patientendaten.", ["D00"], "Patientin");
      return feedback(s, "Die fallbezogene Entbindung ist dokumentiert.");
    }
    if (type === "collect") {
      if (!investigationAllowed(s) && s.phase !== "conditions") return feedback(s, "In diesem Stadium weitere Beweiserhebung beim Gericht anregen; alte Ermittlungsaufträge nicht automatisch als HV-Beweis übernehmen.", "warning");
      s.tick++;
      flush(s);
      return feedback(s, s.jobs.length ? "Verfügbare Rückläufe sind eingeordnet; manche Aufträge warten noch auf Unterlagen." : "Alle derzeit beauftragten Rückläufe sind eingegangen.");
    }
    if (type === "ask") {
      const set = INTERVIEWS[p.interview], q = set == null ? void 0 : set.questions.find((x) => x[0] === p.question);
      if (!q) return feedback(s, "Frage nicht bekannt.", "error");
      if (p.trial) {
        const st = TRIAL_STATIONS.find((x) => x.id === s.activeStation);
        if (s.phase !== "trial" || s.trialStage !== 3 || (st == null ? void 0 : st.interview) !== p.interview) return feedback(s, "Fragen nur in der laufenden gerichtlichen Befragung stellen. Gegebenenfalls erneute Vernehmung beantragen.", "error", "questions");
      } else if (!investigationAllowed(s)) return feedback(s, "Die Ermittlungsvernehmung ist hier nur nachlesbar. Gerichtliche Fragen in der passenden Beweisstation stellen.", "error", "questions");
      if (!s.known.includes(set.doc)) return feedback(s, "Diese Quelle liegt noch nicht vor.", "error");
      if (p.question === "confront" && !s.known.includes("D08")) return feedback(s, "Eine noch nicht bekannte Zeugenaussage kann nicht vorgehalten werden.", "warning");
      if (p.interview === "expert" && p.question === "check" && !(p.trial ? s.introduced.some((x) => x.id === "D09b") : s.known.includes("D09b"))) return feedback(s, "Die Ergänzung zum technischen Befund muss zuerst eingeholt beziehungsweise gerichtlich erörtert werden.", "warning");
      const key = "".concat(p.trial ? "trial" : "invest", ":").concat(p.interview, ":").concat(p.question);
      if (s.answers.includes(key)) return feedback(s, "Die identische Antwort ist bereits dokumentiert und kann nachgelesen werden.");
      s.answers.push(key);
      s.tick++;
      if (p.interview === "defense" && p.question === "name") {
        s.defenseRequest = true;
        disclose(s, ["D06b"], "Konkreter Entlastungsbeweisantrag", "Verteidigung");
        resolveDefense(s);
      }
      event(s, p.trial ? "QUESTION_TO_WITNESS_ASKED" : "QUESTION_ANSWERED", "".concat(set.name, ": ").concat(q[1]), answerFor(p.interview, p.question, s.variant), p.interview === "expert" && p.question === "check" ? ["D09b"] : [set.doc], p.trial ? "Vorsitz erteilt Staatsanwaltschaft das Wort" : "Vernehmung / Korrespondenz", { question: q[1], ruleKind: "teachingNote" });
      return feedback(s, q[3] || "Antwort und Erkenntnisgrenze sind dokumentiert.", q[3] ? "warning" : "info");
    }
    if (type === "defenseRequest") {
      if (!s.defenseOpportunity) return feedback(s, "Zunächst die Anhörungsgelegenheit behandeln.", "error", "hearing");
      s.defenseRequest = true;
      disclose(s, ["D06b"], "Erheblicher Antrag der Verteidigung", "Verteidigung");
      resolveDefense(s);
      return s;
    }
    if (type === "decision") return decide(s, p);
    if (type === "savePlan") return savePlan(s, p);
    if (type === "consent") return consent(s, p);
    if (type === "minorConsent") {
      const m = s.minor;
      if (s.phase !== "minor" || !m) return feedback(s, "Kein laufender §-153-Prüfpfad.", "error");
      const actors = m.basis === "153II" ? ["court", "accused", "prosecution"] : ["court"];
      if (!actors.includes(p.actor) || m.consents[p.actor] === "zugestimmt") return s;
      let yes = p.response !== "refuse", reason = "Zustimmung im gesetzten Ermessensmodell.";
      if (p.actor === "court" && (!eligibleFacts(dispositionFacts(s, m.origin)) || !s.known.includes("D08") && faberKnown(s))) {
        yes = false;
        reason = "Die bekannten Tatsachen tragen im Lehrmodell derzeit geringe hypothetische Schuld und fehlendes Verfolgungsinteresse nicht ausreichend. § 153 ist enger als § 153a; neue Sachaufklärung oder andere Richtung bleiben möglich.";
      }
      m.consents[p.actor] = yes ? "zugestimmt" : "abgelehnt";
      event(s, yes ? "CONSENT_RECEIVED" : "CONSENT_REFUSED", "§ 153: ".concat(p.actor, " ").concat(m.consents[p.actor]), reason, [], p.actor === "court" ? "Gericht" : p.actor === "accused" ? "Verteidigung" : "Staatsanwaltschaft");
      if (actors.every((a) => m.consents[a] === "zugestimmt")) {
        const snap = snapshot(s, "Einstellung", m.basis, m);
        s.decision = { kind: m.basis === "153II" ? "Gerichtliche Einstellung nach § 153 Abs. 2" : "Einstellung nach § 153 Abs. 1", basis: m.basis, reason: m.reason, refs: m.refs, counter: m.counter, feedback: assessment(s, "153"), snapshotId: snap.id };
        s.phase = "closed";
        event(s, "DISPOSITION_CLOSED", s.decision.kind, "Ohne Auflagen, Geldstrafe oder Schuldspruch.", m.refs, m.basis === "153II" ? "Gericht" : "Staatsanwaltschaft");
      }
      return feedback(s, reason, yes ? "info" : "warning", "minor");
    }
    if (type === "cancelDisposition") {
      if (s.phase === "minor" && s.minor) {
        restoreOrigin(s, s.minor.origin);
        s.minor = null;
        return s;
      }
      if (s.phase !== "conditions" || !s.conditions) return s;
      if (s.conditions.activePlan) {
        s.conditions = s.conditions.activePlan;
        return feedback(s, "Änderungsvorschlag verworfen. Der bisher wirksame Auflagenplan gilt weiter.");
      }
      if (s.conditions.status === "running") return feedback(s, "Eine wirksame vorläufige Erledigung lässt sich nicht über Zurück aufheben. Erfüllung oder Frist behandeln.", "error", "conditions");
      restoreOrigin(s, s.conditions.origin);
      s.conditions = null;
      return s;
    }
    if (type === "invalidCondition") {
      const map = { approbation: ["Die Staatsanwaltschaft kann die Approbation nicht „stunden“. Ruhen nach § 6 BÄO ist eine eigene behördliche Entscheidung.", "approbation"], profession: ["Berufsverbot nach § 70 StGB oder vorläufig nach § 132a StPO ist keine frei buchbare §-153a-Auflage.", "profession"], fine: ["Geldstrafe ist eine gerichtliche Rechtsfolge. Hier kommt eine Geldzahlung nach § 153a in Betracht, wenn dessen Voraussetzungen erfüllt sind.", "conditions"], waiver: ["Weder Vergeben noch Anzeigenrücknahme oder umfassender Rechteverzicht darf als Zwangsausgleich gebucht werden. Anzeige, Strafantrag und Ansprüche unterscheiden.", "conditions"], buyout: ["Eine Geldzahlung ersetzt weder fehlende Verdachtsgrundlage noch erhebliche Entlastungsaufklärung.", "objectivity"] };
      const [text, source] = map[p.kind] || map.fine;
      return feedback(s, text, "error", source);
    }
    if (type === "fulfill") {
      const plan = s.conditions;
      if (s.phase !== "conditions" || (plan == null ? void 0 : plan.status) !== "running") return feedback(s, "Erfüllung erst beim wirksamen vorläufigen Auflagenplan dokumentieren.", "error");
      const x = plan.items.find((x2) => x2.id === p.id);
      if (!x || x.done) return s;
      if (p.result === "missing") {
        event(s, "CONDITION_REVIEW", "Nachweis reicht noch nicht", "".concat(x.id, ": kein ausreichender Erfüllungsnachweis; übrige Auflagen und Frist bleiben bestehen."));
        return feedback(s, "Weitere Erfüllung oder Fristproblem behandeln; keine automatische Verurteilung.", "warning", "conditions");
      }
      x.done = true;
      if (x.amount) x.credited = x.amount;
      event(s, "CONDITION_FULFILLED", "Fiktiver Nachweis eingegangen", "".concat(x.id, ": ").concat(x.id === "P03" ? "ernsthaftes Ausgleichsbemühen und Wiedergutmachung beziehungsweise deren Erstreben nachgewiesen; ein Ausgleichserfolg oder Vergeben wird nicht erzwungen" : "bestimmte Leistung innerhalb der Frist nachgewiesen", ". Kein realer Zahlungsvorgang."));
      return finishPlan(s);
    }
    if (type === "extendDeadline") {
      const plan = s.conditions;
      if (s.phase !== "conditions" || (plan == null ? void 0 : plan.status) !== "running" || plan.extensions >= 1) return feedback(s, "Eine Verlängerung ist hier nur beim laufenden Plan und gesetzlich einmal möglich.", "error", "conditions");
      if (!((_a = p.reason) == null ? void 0 : _a.trim())) return feedback(s, "Den konkreten Grund der einmaligen Verlängerung benennen.", "warning", "conditions");
      plan.extensions = 1;
      plan.deadlineMonths += 3;
      event(s, "CONDITION_DEADLINE_EXTENDED", "Einmalige Fristverlängerung", "Drei zusätzliche Monate; Gesamtfrist nun ".concat(plan.deadlineMonths, " Monate. Grund: ").concat(p.reason), [], plan.basis === "153aII" ? "Gericht" : "Staatsanwaltschaft");
      return s;
    }
    if (type === "deadline") {
      if (s.phase !== "conditions" || ((_b = s.conditions) == null ? void 0 : _b.status) !== "running") return s;
      const plan = s.conditions;
      plan.status = "failed";
      restoreOrigin(s, plan.origin);
      event(s, "CONDITION_DEADLINE_REACHED", "Frist ohne vollständige Erfüllung", "Weitere Verfolgung prüfen; keine automatische Verurteilung. Bereits erbrachte Leistungen werden nicht erstattet. Bei gerichtlicher Erledigung entscheidet weiterhin das Gericht.");
      return feedback(s, "Das Verfahren wird im richtigen Stadium fortgesetzt. Bereits erhobene Quellen und Nachweise bleiben gespeichert.", "warning", "conditions");
    }
    if (type === "indict") {
      if (s.phase !== "investigation" && !(s.phase === "conditions" && !((_c = s.conditions) == null ? void 0 : _c.activePlan) && ((_d = s.conditions) == null ? void 0 : _d.status) !== "running" && ((_f = (_e = s.conditions) == null ? void 0 : _e.origin) == null ? void 0 : _f.phase) === "investigation")) return feedback(s, "Die Anklage wird im Ermittlungsverfahren vorbereitet. Eine laufende oder gerichtliche Erledigung nicht einseitig umgehen.", "error");
      if (!s.defenseOpportunity) return feedback(s, "Die notwendige Beschuldigtenanhörung beziehungsweise Äußerungsmöglichkeit fehlt oder läuft noch. Zuerst diesen Rücklauf behandeln.", "error", "hearing");
      if (!defenseOpen(s) && faberKnown(s) && !s.known.includes("D08")) return feedback(s, "Der konkrete bekannte Gesprächszeugenhinweis ist vor belastendem Abschluss aufzuklären; die objektive Ermittlungspflicht hängt nicht erst von einem förmlichen Verteidigungsantrag ab.", "error", "objectivity");
      if (defenseOpen(s)) return feedback(s, "Der erhebliche Entlastungsbeweisantrag zu Faber ist vor belastendem Abschluss zu behandeln.", "error", "hearing");
      if (!["223", "229"].includes(p.delict || "223")) return feedback(s, "Im Kernfall die passende rechtliche Einordnung auswählen.", "error");
      const snap = snapshot(s, "Anklage", "170I", p);
      s.decision = { kind: "Anklage", basis: "170I", reason: p.reason || "", counter: p.counter || "", uncertainty: p.uncertainty || "", refs: snap.refs, exAnteWarnings: readiness(s), snapshotId: snap.id };
      s.indictment = { court: "Amtsgericht Lindenhafen · Strafrichter", defender: "Rechtsanwältin Eva Kern", accused: "Dr. Jonas Falk", date: "16.09.2026", place: "Klinik Lindenbogen, Lindenhafen", delict: p.delict || "223", act: p.act || "Vorwurf einer Meniskusteilresektion am rechten Knie ohne hierfür wirksame Freigabe.", request: "Das Hauptverfahren zu eröffnen.", evidence: snap.refs };
      s.phase = "intermediate";
      s.courtStatus = "review";
      event(s, "INDICTMENT_SUBMITTED", "Anklage eingereicht", p.reason || "Keine eigene Begründung dokumentiert.", snap.refs);
      return feedback(s, "Das Gericht prüft die Eröffnung eigenständig; Anklage allein eröffnet das Verfahren nicht.", "info", "opening");
    }
    if (type === "fork") {
      if (!ended(s)) return feedback(s, "Einen Vergleichszweig erst nach einer Abschlussentscheidung beginnen.", "error");
      const a = clone(s);
      delete a.archive;
      delete a.feedback;
      s.archive.push(a);
      s.parentBranchId = s.branchId;
      s.branchId = "zweig-".concat(s.archive.length + 1);
      s.mode = "hypothetical";
      s.decision = null;
      s.judgment = null;
      s.plea = null;
      s.conditions = null;
      s.minor = null;
      s.introduced = [];
      s.trialStations = [];
      s.closedStations = [];
      s.activeStation = null;
      s.motions = [];
      s.noticeIssued = false;
      s.noticePending = false;
      s.lastWord = false;
      s.closingStep = null;
      s.courtRequested = null;
      s.trialStage = 0;
      s.openingDelict = null;
      s.phase = p.target === "investigation" ? "investigation" : "intermediate";
      s.courtStatus = p.target === "investigation" ? null : "hypothesis";
      if (p.target !== "investigation") {
        s.jobs = [];
        s.indictment = { court: "Amtsgericht Lindenhafen · Strafrichter", defender: "Rechtsanwältin Eva Kern", accused: "Dr. Jonas Falk", date: "16.09.2026", place: "Klinik Lindenbogen, Lindenhafen", delict: "223", act: "Für den Vergleich unterstellter Vorwurf einer nicht gedeckten Meniskusteilresektion.", request: "Anklage und erforderlichenfalls Eröffnung im Übungszweig unterstellt.", evidence: [...s.known] };
      }
      event(s, "COUNTERFACTUAL_BRANCH_CREATED", "Getrennter hypothetischer Übungszweig", "Der frühere Abschluss bleibt unverändert archiviert. Dieselbe Fallvariante; für den Gerichtsweg werden Anklage und gegebenenfalls Eröffnung ausdrücklich unterstellt. Kein nachträgliches Rechtfertigen einer real unzulässigen Anklage.");
      return s;
    }
    if (type === "courtReview") {
      if (s.phase !== "intermediate") return feedback(s, "Keine laufende gerichtliche Eröffnungsprüfung.", "error");
      if (s.courtStatus === "opened" || s.courtStatus === "hypothesis") return s;
      if (s.courtStatus === "review") {
        s.courtStatus = "defensePending";
        event(s, "INDICTMENT_COMMUNICATED", "Anklage mitgeteilt", "Gelegenheit für Einwendungen und Beweisanträge nach § 201. Die angemessene Antwortzeit wird im nächsten fiktiven Rücklauf abgebildet.", [], "Gericht");
        return feedback(s, "Die Verteidigung erhält Gelegenheit zur Stellungnahme. Danach nächsten Rücklauf abrufen.", "info", "service");
      }
      if (!s.known.includes("D06b")) {
        s.defenseRequest = true;
        disclose(s, ["D06b"], "Verteidigung nimmt zur Anklage Stellung", "Verteidigung");
        resolveDefense(s);
      }
      if (!s.known.includes("D08")) {
        s.courtStatus = "supplement";
        event(s, "COURT_SUPPLEMENT_REQUESTED", "Gericht ordnet ergänzende Erhebung an", "Die konkret benannte Gesprächszeugin Faber wird vor der Eröffnungsentscheidung geklärt.", ["D06b"], "Gericht");
        return feedback(s, "Die ergänzende Erhebung kann jetzt durchgeführt werden. Kein Schuldspruch.", "warning", "supplement");
      }
      if (["D01b", "D02", "D03"].some((id) => !s.known.includes(id))) {
        s.courtStatus = "supplement";
        return feedback(s, "Für die konkrete Eröffnungsprüfung fehlen die vollständigen Behandlungsunterlagen. Gezielte Ergänzung bleibt erreichbar.", "warning", "supplement");
      }
      if (facts(s).has("laterConsentWitness")) {
        const reason = "Die entlastende Gesprächsschilderung ist mit dem Zeitablauf vereinbar. Auf der gesetzten Beweislage kein hinreichender Tatverdacht.";
        const snap = snapshot(s, "Nichteröffnung", "204", { reason, refs: ["D08", "D03"] });
        s.courtStatus = "nonopen";
        s.decision = { kind: "Nichteröffnung", basis: "204", reason, refs: snap.refs, snapshotId: snap.id };
        s.phase = "closed";
        event(s, "NONOPENING_DECIDED", "Gericht eröffnet nicht", reason, snap.refs, "Gericht");
        return s;
      }
      s.courtStatus = "opened";
      s.openingDelict = facts(s).has("mistakenBeliefAdmission") && facts(s).has("avoidableCheck") ? "229" : ((_g = s.indictment) == null ? void 0 : _g.delict) || "223";
      event(s, "OPENING_DECIDED", "Hauptverfahren eröffnet", "Das Gericht bejaht im Lehrmodell hinreichenden Tatverdacht. Zugelassene rechtliche Einordnung: § ".concat(s.openingDelict, " StGB. Eine abweichende Würdigung wird im Beschluss erklärt; noch kein Schuldspruch."), [], "Gericht");
      return s;
    }
    if (type === "trialStart") {
      if (s.phase !== "intermediate" || !["opened", "hypothesis"].includes(s.courtStatus)) return feedback(s, "Zuerst Eröffnung oder klar markierte Übungsannahme behandeln.", "error");
      s.phase = "trial";
      s.trialStage = 0;
      s.jobs = [];
      event(s, "TRIAL_STAGE_CHANGED", "Hauptverhandlung beginnt", "Amtsgericht Lindenhafen · Strafrichter. Keine Schöffen im Kernfall. Alte Akteninhalte sind nicht automatisch gerichtlicher Beweisstoff.", [], "Gericht");
      return s;
    }
    if (type === "trialNext") {
      if (s.phase !== "trial" || s.trialStage >= 3) return s;
      s.tick++;
      if (s.trialStage === 0) {
        s.trialStage = 1;
        event(s, "TRIAL_STAGE_CHANGED", "Aufruf, Anwesenheit und Formalien", "Die Vorsitzende stellt die Anwesenheit von Angeklagtem, Verteidigung, Zeugen und Sachverständiger fest. Zeugen warten außerhalb des Saals. Es folgen persönliche Angaben. Studierende bleiben Staatsanwaltschaft.", [], "Gericht");
      } else if (s.trialStage === 1) {
        s.trialStage = 2;
        event(s, "INDICTMENT_READ", "Anklagesatz verlesen", ((_h = s.indictment) == null ? void 0 : _h.act) || "Der konkrete Tatvorwurf wird verlesen; dies beweist ihn nicht.", [], "Staatsanwaltschaft");
        event(s, "UNDERSTANDING_DISCLOSED", "Mitteilung nach § 243 Abs. 4", "Im Lehrfall fanden keine Verständigungsgespräche nach § 257c statt. Frühere Erledigungsprüfungen nach §§ 153/153a sind davon zu unterscheiden.", [], "Vorsitz");
      } else {
        s.trialStage = 3;
        introduce(s, ["H06"], "Freiwillige mündliche Einlassung nach Belehrung", "accused");
        s.trialStations.push("accused");
        s.activeStation = "accused";
        event(s, "DEFENDANT_HEARD", "Gelegenheit zur Einlassung", "Im festgelegten Fall äußert sich Dr. Falk nach Beratung freiwillig. Vollständiges Schweigen wäre zulässig und kein Schuldbeweis. Das frühere Schriftstück D11 ist davon getrennt.", ["H06"], "Gericht");
      }
      return s;
    }
    if (type === "station") return station(s, p);
    if (type === "endStation") {
      if (s.phase === "trial") endStation(s);
      return s;
    }
    if (type === "motion" || type === "reopenEvidence") {
      const reopen = type === "reopenEvidence";
      if (reopen ? !["closing", "lastword"].includes(s.phase) : s.phase !== "trial" || s.trialStage !== 3) return feedback(s, "Den Antrag im passenden Stadium stellen.", "warning", "proof");
      const st = TRIAL_STATIONS.find((x) => x.id === p.station);
      if (!st) return feedback(s, "Ein konkretes verfügbares Beweismittel benennen.", "error", "proof");
      event(s, "EVIDENCE_MOTION_SUBMITTED", reopen ? "Wiedereröffnung angeregt" : "Beweiserhebung beantragt", "Behauptete konkrete Tatsache: ".concat(p.fact || "fehlt", ". Beweismittel: ").concat(st.title, ". Zusammenhang: ").concat(p.link || "noch zu erläutern", "."), [], "Staatsanwaltschaft", { station: st.id });
      if (!((_i = p.fact) == null ? void 0 : _i.trim()) || !reopen && !((_j = p.link) == null ? void 0 : _j.trim())) return feedback(s, "Konkrete Tatsache, bestimmtes Beweismittel und Zusammenhang ergänzen. Nicht jeder freie Text ist automatisch ein förmlicher erheblicher Beweisantrag.", "warning", "proof");
      const key = [type, st.id, p.fact.trim(), p.link || ""].join("|");
      if (s.motions.includes(key)) return feedback(s, "Der identische Antrag wurde bereits behandelt. Neue erhebliche Fragen konkret unterscheiden.");
      s.motions.push(key);
      event(s, "EVIDENCE_MOTION_DECIDED", "Gericht greift die fallbezogene Aufklärung auf", "Die Gerichtssimulation behandelt die gewählte Frage als Ergänzung der vorliegenden Fallthemen. Das ist keine automatische juristische Vollprüfung beliebiger Freitextanträge. In der Realität gelten die gesetzlichen Entscheidungsregeln.", [], "Gericht");
      if (reopen) {
        s.phase = "trial";
        s.trialStage = 3;
        s.plea = null;
        s.lastWord = false;
        s.closingStep = null;
        s.courtRequested = st.id;
        event(s, "EVIDENCE_REOPENED", "Beweisaufnahme erneut eröffnet", "Nach weiterer Beweiserhebung sind Schlussvorträge, Erwiderung und letztes Wort erneut zu wahren.", [], "Gericht");
        return s;
      }
      return station(s, { station: st.id, recall: true, fact: p.fact });
    }
    if (type === "comment") {
      if (s.phase !== "trial" || s.trialStage !== 3) return feedback(s, "Erklärungen nach Beweiserhebung in der Beweisaufnahme abgeben. Schlussvorträge haben ihren eigenen Platz.", "error", "explanation");
      if (!((_k = p.text) == null ? void 0 : _k.trim())) return feedback(s, "Die konkrete Erklärung eintragen.", "warning");
      event(s, "PROSECUTION_POSITION_CHANGED", "Erklärung der Staatsanwaltschaft", String(p.text).slice(0, 12e3), validRefs(s, p.refs || [], true), "Staatsanwaltschaft", { source: "explanation" });
      return s;
    }
    if (type === "closeEvidence") {
      if (s.phase !== "trial" || s.trialStage !== 3) return s;
      if (s.courtRequested) return feedback(s, "Die konkret angekündigte gerichtliche Beweiserhebung ist noch offen. Zuerst behandeln.", "warning", "proof");
      const f = facts(s, true), required = ["patient", "documents", "faber", "expert"];
      if (f.has("mistakenBeliefAdmission")) required.push("technical", "expertSupplement");
      if (judge(s).kind === "conviction") required.push("personal");
      const missing = required.find((id) => !s.trialStations.includes(id));
      if (missing) {
        s.courtRequested = missing;
        event(s, "COURT_SUPPLEMENT_REQUESTED", "Gericht klärt von Amts wegen weiter", TRIAL_STATIONS.find((x) => x.id === missing).title, [], "Gericht");
        return feedback(s, "Für die gerichtliche Aufklärung noch die angezeigte Station behandeln. Keine allgemeine Sammelpflicht; diese Punkte sind im konkreten Lehrfall erheblich.", "warning", "proof");
      }
      const possible = judge(s).delict, admitted = s.openingDelict || ((_l = s.indictment) == null ? void 0 : _l.delict) || "223";
      if (s.noticePending) return feedback(s, "Die Gelegenheit zur Verteidigung nach dem Hinweis ist noch offen.", "error", "notice");
      if (possible && possible !== admitted && !s.noticeIssued) {
        s.noticePending = true;
        event(s, "LEGAL_NOTICE", "Hinweis auf veränderten rechtlichen Gesichtspunkt", "Mögliche Bewertung nach § ".concat(possible, " StGB statt § ").concat(admitted, " StGB. Die Verteidigung erhält Gelegenheit zur Vorbereitung und Stellungnahme."), [], "Gericht");
        return feedback(s, "Zuerst die Verteidigungsmöglichkeit nach dem gerichtlichen Hinweis behandeln.", "warning", "notice");
      }
      if (s.noticePending) return feedback(s, "Die Gelegenheit zur Verteidigung nach dem Hinweis ist noch offen.", "error", "notice");
      endStation(s);
      s.phase = "closing";
      event(s, "EVIDENCE_CLOSED", "Beweisaufnahme geschlossen", "Es folgen Schlussvorträge auf Grundlage des Inbegriffs der Hauptverhandlung.", [], "Gericht");
      return s;
    }
    if (type === "noticeResponse") {
      if (s.phase !== "trial" || !s.noticePending) return s;
      s.noticePending = false;
      s.noticeIssued = true;
      event(s, "DEFENSE_AFTER_NOTICE", "Verteidigungsmöglichkeit gewahrt", p.response === "pause" ? "Im Lehrfall wird die notwendige Unterbrechung zur Vorbereitung gewährt. Danach kann die Verteidigung Stellung nehmen; keine reale Wartezeit." : "Nach gewährter Gelegenheit erklärt die Verteidigung im Lehrfall, vorbereitet Stellung nehmen zu können. Eine erforderliche Unterbrechung wäre zu prüfen.", [], "Gericht / Verteidigung");
      return s;
    }
    if (type === "plea") {
      if (s.phase !== "closing") return feedback(s, "Schlussvortrag erst nach der Beweisaufnahme.", "error");
      if (!["acquit", "convict"].includes(p.request)) return feedback(s, "Antrag auswählen.", "error");
      if (p.request === "convict" && (!Number.isInteger(Number(p.days)) || Number(p.days) < 5 || Number(p.days) > 360)) return feedback(s, "Für den einzelnen Vorwurf eine ganze Tagessatzanzahl von 5 bis 360 wählen.", "error", "sentence");
      if (p.request === "convict" && !["223", "229"].includes(p.delict || "223")) return feedback(s, "Passende rechtliche Einordnung wählen.", "error");
      s.plea = { request: p.request, delict: p.request === "convict" ? p.delict || "223" : null, reason: p.reason || "", counter: p.counter || "", refs: validRefs(s, p.refs || [], true), charge: p.charge || "", findings: p.findings || "", legal: p.legal || "", doubts: p.doubts || "", sentencing: p.sentencing || "", days: p.request === "convict" ? Number(p.days) : null, daily: p.request === "convict" ? 120 : null };
      event(s, "CLOSING_SUBMITTED", p.request === "acquit" ? "Freispruch beantragt" : "Verurteilung beantragt", s.plea.reason || "Keine eigene Begründung eingetragen.", s.plea.refs);
      s.phase = "lastword";
      s.closingStep = "defense";
      return s;
    }
    if (type === "defenseClosing") {
      if (s.phase !== "lastword" || s.closingStep !== "defense") return s;
      event(s, "DEFENSE_CLOSING", "Schlussvortrag der Verteidigung", "Die Verteidigung nimmt zum vorhandenen Beweisstoff und zur rechtlichen Bewertung Stellung. Sie verlangt, die verbleibenden Zweifel sowie die individuellen Voraussetzungen zu beachten; keine neue Beweistatsache.", [], "Verteidigung");
      s.closingStep = "reply";
      return s;
    }
    if (type === "reply") {
      if (s.phase !== "lastword" || s.closingStep !== "reply") return feedback(s, "Zunächst den Schlussvortrag der Verteidigung behandeln.", "error", "lastWord");
      event(s, "PROSECUTION_REPLY", ((_m = p.text) == null ? void 0 : _m.trim()) ? "Staatsanwaltschaft erwidert" : "Keine weitere Erwiderung", ((_n = p.text) == null ? void 0 : _n.trim()) || "Die Staatsanwaltschaft verzichtet auf eine weitere Erwiderung. Das letzte Wort folgt.");
      s.closingStep = "lastword";
      return s;
    }
    if (type === "lastWord") {
      if (s.phase !== "lastword" || s.closingStep !== "lastword") return feedback(s, "Verteidigung und Erwiderungsmöglichkeit müssen vor dem letzten Wort gewahrt sein.", "error", "lastWord");
      s.lastWord = true;
      event(s, "LAST_WORD_GRANTED", "Letztes Wort persönlich gewährt", "Auch nach dem Verteidigervortrag wird Dr. Falk persönlich nach weiteren Ausführungen gefragt. Im Lehrfall keine neue Beweisinformation. Danach berät und entscheidet das Gericht.", [], "Gericht");
      s.judgment = judge(s);
      snapshot(s, "Urteil", s.judgment.delict || "acquittal", { reason: s.judgment.reason, refs: s.introduced.map((x) => x.id) });
      s.phase = "judgment";
      event(s, "JUDGMENT_PRONOUNCED", s.judgment.title, s.judgment.reason, s.introduced.map((x) => x.id), "Gericht");
      return s;
    }
    return feedback(s, "Unbekannter Vorgang.", "error");
  }
  function rubric(s) {
    var _a, _b, _c, _d, _e;
    const adverse = s.log.filter((e) => e.type === "ACTION_REJECTED_WITH_GUIDANCE").length, decisionSnapshot = s.snapshots.find((x) => {
      var _a2;
      return x.id === ((_a2 = s.decision) == null ? void 0 : _a2.snapshotId);
    }), then = (decisionSnapshot == null ? void 0 : decisionSnapshot.known) || s.known;
    return [
      { title: "Objektive Sachaufklärung", ok: then.includes("D08"), text: then.includes("D08") ? "Die Gesprächszeugin war im damaligen Entscheidungsstand bekannt. Ihre Wahrnehmungsgrenze bleibt zu würdigen." : "Die präoperative Gesprächssituation blieb damals offen; spätere gerichtliche Erkenntnisse dürfen die damalige Bewertung nicht rückwirkend ersetzen." },
      { title: "Verfahrensrechte", ok: s.defenseOpportunity || ((_a = s.decision) == null ? void 0 : _a.basis) === "170II", text: s.defenseOpportunity ? "Einladung und tatsächlich eingeräumte Gelegenheit werden getrennt dokumentiert. Schweigen ist kein Belastungsbeweis." : "Bei Einstellung ist die Ausnahme des § 163a zu prüfen. Vor Anklage wäre die fehlende Gelegenheit problematisch." },
      { title: "Beweisgrenzen", ok: s.answers.some((x) => /time|exclude|source|certainty/.test(x)), text: "Eigene Wahrnehmung, mittelbare Kenntnis, Dokument und eigene Schlussfolgerung unterscheiden. Die Anzeige ist kein Tatnachweis." },
      { title: "Begründung und Gegenargumente", ok: Boolean(((_c = (_b = s.plea) == null ? void 0 : _b.reason) == null ? void 0 : _c.trim()) || ((_e = (_d = s.decision) == null ? void 0 : _d.reason) == null ? void 0 : _e.trim())), text: "Quellen, stärkste Gegenargumente und Unsicherheit anhand der eigenen Begründung gemeinsam besprechen. Freitext erhält keine scheinpräzise automatische Rechtsnote." },
      { title: "Gerichtlicher Beweisstoff", ok: s.introduced.length > 0, text: s.introduced.length ? "Mündliche Einlassung, Urkunden, persönliche Vernehmung und Gutachtenergänzung werden getrennt eingeführt." : "Ein getrennter hypothetischer Gerichtsweg bleibt nach Abschluss erreichbar." },
      { title: "Korrektur und Lernweg", ok: true, text: adverse ? "".concat(adverse, " Vorschlag/Vorschläge wurden rechtlich korrigiert. Korrekturen sind Lernereignisse und keine angeordneten Sanktionen.") : "Nachvollziehbarkeit und Objektivität zählen. Verurteilung bringt keine Extrapunkte." }
    ];
  }
  function recordTransition(input2, result, kind, op, args) {
    const base = input2.traceBase || (() => {
      const b = clone(input2);
      delete b.traceBase;
      delete b.journal;
      return b;
    })();
    result.traceBase = clone(base);
    result.journal = [...input2.journal || [], { kind, op, args: clone(args) }];
    return result;
  }
  function perform(input2, id, opts = {}) {
    return recordTransition(input2, performTransition(input2, id, opts), "action", id, opts);
  }
  function command(input2, type, p = {}) {
    return recordTransition(input2, commandTransition(input2, type, p), "command", type, p);
  }

  // content-update/input-20261106-practice-ux/draft/demo/casefile-text.mjs
  var laws = { 6: "BÄO", 24: "GVG", 25: "GVG", 40: "StGB", 46: "StGB", 53: "StPO", "53a": "StPO", 70: "StGB", 94: "StPO", 97: "StPO", 98: "StPO", "132a": "StPO", 136: "StPO", 147: "StPO", 152: "StPO", 153: "StPO", "153a": "StPO", 160: "StPO", "163a": "StPO", 170: "StPO", 171: "StPO", 172: "StPO", 200: "StPO", 201: "StPO", 202: "StPO", 203: "StPO", 204: "StPO", 210: "StPO", 211: "StPO", 223: "StGB", 229: "StGB", 230: "StGB", 240: "StPO", 243: "StPO", 244: "StPO", 249: "StPO", 250: "StPO", 257: "StPO", "257c": "StPO", 258: "StPO", 261: "StPO", 265: "StPO", 374: "StPO", 376: "StPO", 407: "StPO", 410: "StPO", "630h": "BGB" };
  function qualifyCasefileText(value) {
    return value.replace(/§-153a-Auflage/g, "Auflage nach § 153a StPO").replace(/§-153-Prüfpfad/g, "Prüfpfad nach § 153 StPO").replace(/(§{1,2}[\s\u00a0]*(\d+[a-z]?)(?:(?:\s*(?:Abs\.|Satz|S\.|Nr\.)\s*\d+[a-z]?)|(?:\s*(?:,|\/|–|-|und)\s*\d+[a-z]?))*)(?![\da-z])/g, (whole, display, number, offset, text) => {
      if (!laws[number] || /^\s*(?:BGB|StGB|StPO|GVG|BÄO)\b/.test(text.slice(offset + whole.length))) return whole;
      return display + " " + laws[number];
    });
  }
  function qualifiedCasefileView(value) {
    if (typeof value === "string") return qualifyCasefileText(value);
    if (Array.isArray(value)) return value.map(qualifiedCasefileView);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, qualifiedCasefileView(entry)]));
    return value;
  }

  // content-update/input-20261106-practice-ux/draft/demo/casefile-runtime.mjs
  var ENGINE_VERSION = "casefile-ui-98340745942f709fa222-demoA";
  var RULESET_VERSION = "rules-31cc7db90c6999cf27bf";
  var FORMAT = "recht-medizinisch-casefile";
  var MAX_CHECKPOINT = 6e5;
  var MAX_COMMANDS = 2e3;
  var MAX_STATE = 8e6;
  var commands = /* @__PURE__ */ new Set(["start", "read", "note", "debrief", "release", "collect", "ask", "defenseRequest", "decision", "savePlan", "consent", "minorConsent", "cancelDisposition", "invalidCondition", "fulfill", "extendDeadline", "deadline", "indict", "fork", "courtReview", "trialStart", "trialNext", "station", "endStation", "motion", "reopenEvidence", "comment", "closeEvidence", "noticeResponse", "plea", "defenseClosing", "reply", "lastWord"]);
  var strings = /* @__PURE__ */ new Set(["act", "actor", "basis", "charge", "counter", "delict", "doubts", "fact", "findings", "id", "interview", "key", "kind", "legal", "link", "purpose", "question", "reason", "request", "response", "result", "route", "scope", "sentencing", "station", "target", "text", "uncertainty", "form"]);
  var booleans = /* @__PURE__ */ new Set(["recall", "trial", "delegated"]);
  var numbers = /* @__PURE__ */ new Set(["days", "months"]);
  var lists = /* @__PURE__ */ new Set(["refs", "questions"]);
  var clone2 = (value) => JSON.parse(JSON.stringify(value));
  function utf8Length(value) {
    let count = 0;
    for (let i = 0; i < value.length; i++) {
      const c = value.charCodeAt(i);
      if (c < 128) count++;
      else if (c < 2048) count += 2;
      else if (c >= 55296 && c <= 56319 && value.charCodeAt(i + 1) >= 56320 && value.charCodeAt(i + 1) <= 57343) {
        count += 4;
        i++;
      } else count += 3;
    }
    return count;
  }
  function requireValue(ok, message = "Die Sicherung enthält ungültige Daten.") {
    if (!ok) throw Error(message);
  }
  var object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  function exactKeys(value, allowed) {
    requireValue(object(value));
    requireValue(Object.keys(value).every((k) => allowed.includes(k) && !["__proto__", "prototype", "constructor"].includes(k)));
  }
  function input(value) {
    var _a;
    exactKeys(value, ["kind", "op", "args"]);
    requireValue(["command", "action"].includes(value.kind) && typeof value.op === "string");
    requireValue(value.kind === "command" ? commands.has(value.op) : ACTIONS.some((a) => a.id === value.op));
    const args = (_a = value.args) != null ? _a : {};
    requireValue(object(args));
    const clean = {};
    for (const key of Object.keys(args)) {
      const v = args[key];
      if (strings.has(key)) {
        requireValue(typeof v === "string" && v.length <= 12e3);
        clean[key] = v;
      } else if (booleans.has(key)) {
        requireValue(typeof v === "boolean");
        clean[key] = v;
      } else if (numbers.has(key)) {
        requireValue(Number.isSafeInteger(v) && v >= 0 && v <= 1e4);
        clean[key] = v;
      } else if (lists.has(key)) {
        requireValue(Array.isArray(v) && v.length <= 100 && v.every((x) => typeof x === "string" && x.length <= 120));
        if (key === "refs") requireValue(v.every((id) => !!EVIDENCE[id]));
        clean[key] = [...v];
      } else if (key === "items") {
        requireValue(Array.isArray(v) && v.length <= 3);
        clean.items = v.map((item) => {
          exactKeys(item, ["id", "amount", "recipient"]);
          requireValue(["P01", "P02", "P03"].includes(item.id));
          if (item.amount !== void 0) requireValue(Number.isSafeInteger(item.amount) && item.amount >= 0 && item.amount <= 1e6);
          if (item.recipient !== void 0) requireValue(typeof item.recipient === "string" && item.recipient.length <= 200);
          return clone2(item);
        });
      } else throw Error("Ein Eingabefeld wird von dieser Aktenversion nicht unterstützt.");
    }
    if (value.kind === "command" && value.op === "fulfill") requireValue(["P01", "P02", "P03"].includes(clean.id) && ["confirmed", "missing"].includes(clean.result), "Bitte unterscheiden Sie bestätigte und noch fehlende Erfüllungsnachweise.");
    if (value.kind === "command" && ["consent", "minorConsent"].includes(value.op)) requireValue(["accused", "court", "prosecution"].includes(clean.actor) && (clean.response === void 0 || ["accept", "refuse"].includes(clean.response)), "Die Rückmeldung muss Zustimmung oder Ablehnung eindeutig benennen.");
    return { kind: value.kind, op: value.op, args: clean };
  }
  function envelope(value) {
    exactKeys(value, ["format", "version", "engineVersion", "rulesetVersion", "variant", "group", "settings", "sessionId", "journal"]);
    requireValue(value.format === FORMAT && value.version === 1 && value.rulesetVersion === RULESET_VERSION, "Diese Aktenversion kann hier noch nicht wiederhergestellt werden. Die gespeicherte Datei bleibt erhalten.");
    requireValue(typeof value.engineVersion === "string" && value.engineVersion.length <= 100);
    requireValue(value.variant === "A" && typeof value.group === "string" && value.group.length <= 80);
    requireValue(typeof value.sessionId === "string" && /^[a-zA-Z0-9-]{1,100}$/.test(value.sessionId));
    exactKeys(value.settings, ["minutes", "hints", "judgeView"]);
    requireValue(Number.isSafeInteger(value.settings.minutes) && value.settings.minutes >= 15 && value.settings.minutes <= 240 && typeof value.settings.hints === "boolean" && typeof value.settings.judgeView === "boolean");
    requireValue(Array.isArray(value.journal) && value.journal.length <= MAX_COMMANDS, "Die Akte ist sehr umfangreich. Bitte sichern Sie den bisherigen Stand, bevor Sie eine neue Akte beginnen.");
    requireValue(utf8Length(JSON.stringify(value)) <= MAX_CHECKPOINT, "Die Akten-Sicherung ist zu groß. Ihr bisheriger Stand bleibt erhalten.");
    return __spreadProps(__spreadValues({}, value), { settings: clone2(value.settings), journal: value.journal.map(input) });
  }
  function pack(state) {
    return { format: FORMAT, version: 1, engineVersion: ENGINE_VERSION, rulesetVersion: RULESET_VERSION, variant: state.variant, group: state.group, settings: clone2(state.settings), sessionId: state.sessionId, journal: state.journal.map(input) };
  }
  function replay(checkpoint) {
    const saved = envelope(checkpoint);
    requireValue(saved.journal.length <= 100, "Diese umfangreiche Akte wird schrittweise wiederhergestellt. Bitte öffnen Sie sie erneut.");
    let state = initialState(saved.variant, saved.group, saved.settings);
    state.sessionId = saved.sessionId;
    state.traceBase.sessionId = saved.sessionId;
    let work = 0;
    for (const step of saved.journal) {
      work += utf8Length(JSON.stringify(state));
      requireValue(work <= 16e6, "Diese umfangreiche Akte wird schrittweise wiederhergestellt. Bitte öffnen Sie sie erneut.");
      state = step.kind === "action" ? perform(state, step.op, step.args) : command(state, step.op, step.args);
      requireValue(utf8Length(JSON.stringify(state)) <= MAX_STATE, "Die Akte hat die sichere Arbeitsgröße erreicht. Bitte sichern Sie den bisherigen Stand.");
    }
    return state;
  }
  function recordedAnswer(state, id, q, trial) {
    if (!state.answers.includes((trial ? "trial" : "invest") + ":" + id + ":" + q[0])) return null;
    const type = trial ? "QUESTION_TO_WITNESS_ASKED" : "QUESTION_ANSWERED";
    const row = state.log.slice().reverse().find((e) => e.type === type && e.title === INTERVIEWS[id].name + ": " + q[1]);
    return row ? row.detail : null;
  }
  function view(state, logPage = 0) {
    var _a;
    const ended2 = ["closed", "judgment"].includes(state.phase);
    return qualifiedCasefileView({
      variant: state.variant,
      phase: state.phase,
      phaseTitle: (_a = { intake: "Einstieg", investigation: "Ermittlungsverfahren", intermediate: "Zwischenverfahren", conditions: "Auflagen prüfen", minor: "Einstellung ohne Auflagen", trial: "Hauptverhandlung", closing: "Schlussvorträge", lastword: "Letztes Wort", closed: "Verfahren beendet", judgment: "Gerichtliche Entscheidung" }[state.phase]) != null ? _a : "Strafakte",
      branchId: state.branchId,
      mode: state.mode,
      ended: ended2,
      documents: state.known.map((id) => __spreadProps(__spreadValues({ id }, evidence(id, state.variant)), { read: state.read.includes(id) })),
      actions: ACTIONS.map((a) => {
        var _a2, _b;
        return __spreadValues({ id: a.id, title: a.title, description: a.desc, group: a.group, interview: (_a2 = a.interview) != null ? _a2 : null, requiresRelease: !!a.release, documentIds: (_b = a.docs) != null ? _b : [] }, actionStatus(state, a.id));
      }),
      interviews: Object.entries(INTERVIEWS).map(([id, value]) => ({ id, name: value.name, role: value.role, document: value.doc, questions: value.questions.map((q) => ({ id: q[0], text: q[1], answer: recordedAnswer(state, id, q, false), trialAnswer: recordedAnswer(state, id, q, true) })) })),
      stations: TRIAL_STATIONS.map((s) => {
        var _a2;
        return { id: s.id, title: s.title, description: s.desc, interview: (_a2 = s.interview) != null ? _a2 : null, completed: state.closedStations.includes(s.id), active: state.activeStation === s.id };
      }),
      readiness: readiness(state),
      feedback: state.feedback,
      introduced: state.introduced,
      activeStation: state.activeStation,
      trialStage: state.trialStage,
      closingStep: state.closingStep,
      courtStatus: state.courtStatus,
      defenseOpportunity: state.defenseOpportunity,
      defenseRequest: state.defenseRequest,
      release: state.release,
      conditions: state.conditions,
      minor: state.minor,
      decision: state.decision,
      judgment: state.judgment,
      plea: state.plea,
      snapshots: state.snapshots,
      notes: state.notes,
      log: state.log.slice(Math.max(0, state.log.length - (logPage + 1) * 100), Math.max(0, state.log.length - logPage * 100)),
      logPage,
      logPages: Math.max(1, Math.ceil(state.log.length / 100)),
      totalLogEntries: state.log.length,
      archiveCount: state.archive.length,
      archives: state.archive.map((a) => ({ branchId: a.branchId, phase: a.phase, decision: a.decision, judgment: a.judgment, plea: a.plea, snapshotIds: a.snapshots.map((x) => x.id), known: a.known.map((id) => ({ id, title: evidence(id, state.variant).title })) })),
      rubric: ended2 ? rubric(state) : [],
      solution: ended2 ? VARIANTS[state.variant].solution : null,
      sources: SOURCES,
      glossary: GLOSSARY
    });
  }
  function createRuntime() {
    let current = null, revision = 0, pending = null, restoreSequence = 0;
    function result(candidate) {
      const checkpoint = envelope(pack(candidate)), model = view(candidate);
      requireValue(utf8Length(JSON.stringify(candidate)) <= MAX_STATE, "Die Akte hat die sichere Arbeitsgröße erreicht. Bitte sichern Sie den bisherigen Stand.");
      requireValue(utf8Length(JSON.stringify(model)) <= 2e6, "Die Aktenansicht ist zu umfangreich. Ihr bisheriger Stand bleibt erhalten; sichern Sie ihn bitte, bevor Sie eine neue Akte beginnen.");
      current = candidate;
      revision++;
      return { ok: true, revision, engineVersion: ENGINE_VERSION, checkpoint, view: model };
    }
    return {
      dispatch(request) {
        var _a, _b, _c;
        let processingRestore = false;
        try {
          requireValue(object(request));
          if (request.op === "beginRestore") {
            requireValue(!pending, "Die Wiederherstellung läuft noch.");
            const saved = envelope(request.checkpoint), state = initialState(saved.variant, saved.group, saved.settings);
            state.sessionId = saved.sessionId;
            state.traceBase.sessionId = saved.sessionId;
            pending = { token: "restore-" + ++restoreSequence, saved, state, index: 0 };
            return { ok: true, revision, restoring: true, restoreToken: pending.token, done: 0, total: saved.journal.length };
          }
          if (request.op === "cancelRestore") {
            requireValue(!pending || pending.token === request.restoreToken, "Die Wiederherstellung ist nicht mehr aktuell.");
            pending = null;
            return { ok: true, revision, restoring: false };
          }
          if (request.op === "continueRestore") {
            requireValue(pending && pending.token === request.restoreToken, "Die Wiederherstellung ist nicht mehr aktuell.");
            processingRestore = true;
            const end = Math.min(pending.index + 8, pending.saved.journal.length);
            for (; pending.index < end; pending.index++) {
              const step2 = pending.saved.journal[pending.index];
              pending.state = step2.kind === "action" ? perform(pending.state, step2.op, step2.args) : command(pending.state, step2.op, step2.args);
              requireValue(utf8Length(JSON.stringify(pending.state)) <= MAX_STATE, "Die Akte hat die sichere Arbeitsgröße erreicht. Ihr gespeicherter Stand bleibt erhalten.");
            }
            if (pending.index === pending.saved.journal.length) {
              const candidate2 = pending.state;
              pending = null;
              return result(candidate2);
            }
            return { ok: true, revision, restoring: true, restoreToken: pending.token, done: pending.index, total: pending.saved.journal.length };
          }
          requireValue(!pending, "Die Wiederherstellung läuft noch.");
          if (request.op === "initialize") requireValue(((_a = request.variant) != null ? _a : "A") === "A", "Weitere Fälle sind mit Premium verfügbar.");
          if (request.op === "initialize") return result(initialState((_b = request.variant) != null ? _b : "A", "", { minutes: 90, hints: true, judgeView: true }));
          if (request.op === "restore") return result(replay(request.checkpoint));
          requireValue(current !== null, "Bitte öffnen Sie die Akte erneut.");
          requireValue(request.revision === revision, "Der Aktenstand hat sich geändert. Bitte laden Sie den letzten gespeicherten Stand.");
          if (request.op === "inspect") {
            const page = (_c = request.logPage) != null ? _c : 0;
            requireValue(Number.isInteger(page) && page >= 0 && page < Math.max(1, Math.ceil(current.log.length / 100)));
            return { ok: true, revision, engineVersion: ENGINE_VERSION, checkpoint: pack(current), view: view(current, page) };
          }
          requireValue(request.op === "apply");
          const step = input(request.action);
          const candidate = step.kind === "action" ? perform(current, step.op, step.args) : command(current, step.op, step.args);
          return result(candidate);
        } catch (error) {
          if (processingRestore) pending = null;
          return { ok: false, revision, error: String(error.message || "Die Akte konnte nicht verarbeitet werden. Ihr bisheriger Stand bleibt erhalten.") };
        }
      },
      dispatchJSON(raw) {
        try {
          requireValue(typeof raw === "string" && raw.length <= MAX_CHECKPOINT + 2e4 && utf8Length(raw) <= MAX_CHECKPOINT + 2e4);
          return JSON.stringify(this.dispatch(JSON.parse(raw)));
        } catch (error) {
          return JSON.stringify({ ok: false, revision, error: String(error.message) });
        }
      }
    };
  }
  var runtime = createRuntime();
  var dispatchJSON = (raw) => runtime.dispatchJSON(raw);
  return __toCommonJS(casefile_runtime_exports);
})();
