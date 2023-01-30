package emu.grasscutter.tools;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.LongStream;

import emu.grasscutter.GameConstants;
import emu.grasscutter.Grasscutter;
import emu.grasscutter.command.CommandHandler;
import emu.grasscutter.command.CommandMap;
import emu.grasscutter.data.GameData;
import emu.grasscutter.data.ResourceLoader;
import emu.grasscutter.data.excels.AvatarData;
import emu.grasscutter.data.excels.ItemData;
import emu.grasscutter.game.inventory.ItemType;
import emu.grasscutter.game.props.FightProperty;
import emu.grasscutter.utils.Language;
import emu.grasscutter.utils.Language.TextStrings;
import it.unimi.dsi.fastutil.ints.Int2IntRBTreeMap;
import it.unimi.dsi.fastutil.ints.Int2ObjectRBTreeMap;
import lombok.val;

import static emu.grasscutter.utils.FileUtils.getResourcePath;
import static emu.grasscutter.utils.Language.getTextMapKey;

public final class Tools {
    public static void createGmHandbooks(boolean message) throws Exception {
        val languages = Language.TextStrings.getLanguages();

        ResourceLoader.loadAll();
        val mainQuestTitles = new Int2IntRBTreeMap(GameData.getMainQuestDataMap().int2ObjectEntrySet().stream().collect(Collectors.toMap(e -> (int) e.getIntKey(), e -> (int) e.getValue().getTitleTextMapHash())));
        // val questDescs = new Int2IntRBTreeMap(GameData.getQuestDataMap().int2ObjectEntrySet().stream().collect(Collectors.toMap(e -> (int) e.getIntKey(), e -> (int) e.getValue().getDescTextMapHash())));

        val avatarDataMap = new Int2ObjectRBTreeMap<>(GameData.getAvatarDataMap());
        val itemDataMap = new Int2ObjectRBTreeMap<>(GameData.getItemDataMap());
        val monsterDataMap = new Int2ObjectRBTreeMap<>(GameData.getMonsterDataMap());
        val sceneDataMap = new Int2ObjectRBTreeMap<>(GameData.getSceneDataMap());
        val questDataMap = new Int2ObjectRBTreeMap<>(GameData.getQuestDataMap());

        Function<SortedMap, String> getPad = m -> "%" + m.lastKey().toString().length() + "s : ";

        // Create builders and helper functions
        val handbookBuilders = IntStream.range(0, TextStrings.NUM_LANGUAGES).mapToObj(i -> new StringBuilder()).toList();
        var h = new Object() {
            void newLine(String line) {
                handbookBuilders.forEach(b -> b.append(line + "\n"));
            }

            void newSection(String title) {
                newLine("\n\n// " + title);
            }

            void newTranslatedLine(String template, TextStrings... textstrings) {
                for (int i = 0; i < TextStrings.NUM_LANGUAGES; i++) {
                    String s = template;
                    for (int j = 0; j < textstrings.length; j++)
                        s = s.replace("{"+j+"}", textstrings[j].strings[i]);
                    handbookBuilders.get(i).append(s + "\n");
                }
            }

            void newTranslatedRankLine(String template, int rankLevel, TextStrings... textstrings) {
                for (int i = 0; i < TextStrings.NUM_LANGUAGES; i++) {
                    String s = template;
                    for (int j = 0; j < textstrings.length; j++)
                        s = s.replace("{" + j + "}", textstrings[j].strings[i]) + "-" + rankLevel;
                    handbookBuilders.get(i).append(s).append("\n");
                }
            }

            void newTranslatedLine(String template, long... hashes) {
                newTranslatedLine(template, LongStream.of(hashes)
                    .mapToObj(Language::getTextMapKey)
                    .toArray(TextStrings[]::new)
                );
            }
        };

        // Preamble
        h.newLine("// Grasscutter " + GameConstants.VERSION + " GM Handbook");
        h.newLine("// Created " + DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss").format(LocalDateTime.now()));

       val mainPropData = new Int2ObjectRBTreeMap<>(GameData.getReliquaryMainPropDataMap());

       // MainProp
       h.newSection("MainProp");
       mainPropData.forEach((id, data) ->
           h.newLine(id + " : " + data.getFightProp().toString()));


       val propData = new Int2ObjectRBTreeMap<>(GameData.getReliquaryAffixDataMap());

       // PropData
       h.newSection("PropData");
       propData.forEach((id, data) -> {
           String valueStr = FightProperty.isPercentage(data.getFightProp()) ?
               String.format("%.1f%%", data.getPropValue() * 100f)
               : String.format("%.0f", data.getPropValue());
           h.newLine(id + " : " + FightProperty.getPropById(
                   data.getGroupId()
               ).toString() + " + " + valueStr
           );
       });

        // Write txt files
        // for (int i = 0; i < TextStrings.NUM_LANGUAGES; i++) {
            File GMHandbookOutputpath=new File("./GM Handbook");
            GMHandbookOutputpath.mkdir();
            final String fileName = "./GM Handbook/GM Handbook Global Prop.txt";
            try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(new FileOutputStream(fileName), StandardCharsets.UTF_8), false)) {
                writer.write(handbookBuilders.get(0).toString());
            }
        // }
        Grasscutter.getLogger().info("GM Handbooks generated!");
    }

    public static List<String> createGachaMappingJsons() {
        final int NUM_LANGUAGES = Language.TextStrings.NUM_LANGUAGES;
        final Language.TextStrings CHARACTER = Language.getTextMapKey(4233146695L);  // "Character" in EN
        final Language.TextStrings WEAPON = Language.getTextMapKey(4231343903L);  // "Weapon" in EN
        final Language.TextStrings STANDARD_WISH = Language.getTextMapKey(332935371L);  // "Standard Wish" in EN
        final Language.TextStrings CHARACTER_EVENT_WISH = Language.getTextMapKey(2272170627L);  // "Character Event Wish" in EN
        final Language.TextStrings CHARACTER_EVENT_WISH_2 = Language.getTextMapKey(3352513147L);  // "Character Event Wish-2" in EN
        final Language.TextStrings WEAPON_EVENT_WISH = Language.getTextMapKey(2864268523L);  // "Weapon Event Wish" in EN
        final List<StringBuilder> sbs = new ArrayList<>(NUM_LANGUAGES);
        for (int langIdx = 0; langIdx < NUM_LANGUAGES; langIdx++)
            sbs.add(new StringBuilder("{\n"));  // Web requests should never need Windows line endings

        // Avatars
        GameData.getAvatarDataMap().keySet().intStream().sorted().forEach(id -> {
            AvatarData data = GameData.getAvatarDataMap().get(id);
            int avatarID = data.getId();
            if (avatarID >= 11000000) { // skip test avatar
                return;
            }
            String color = switch (data.getQualityType()) {
                case "QUALITY_PURPLE" -> "purple";
                case "QUALITY_ORANGE" -> "yellow";
                case "QUALITY_BLUE" -> "blue";
                default -> "";
            };
            Language.TextStrings avatarName = Language.getTextMapKey(data.getNameTextMapHash());
            for (int langIdx = 0; langIdx < NUM_LANGUAGES; langIdx++) {
                sbs.get(langIdx)
                        .append("\t\"")
                        .append(avatarID % 1000 + 1000)
                        .append("\": [\"")
                        .append(avatarName.get(langIdx))
                        .append(" (")
                        .append(CHARACTER.get(langIdx))
                        .append(")\", \"")
                        .append(color)
                        .append("\"],\n");
            }
        });

        // Weapons
        GameData.getItemDataMap().keySet().intStream().sorted().forEach(id -> {
            ItemData data = GameData.getItemDataMap().get(id);
            if (data.getId() <= 11101 || data.getId() >= 20000) {
                return; //skip non weapon items
            }
            String color = switch (data.getRankLevel()) {
                case 3 -> "blue";
                case 4 -> "purple";
                case 5 -> "yellow";
                default -> null;
            };
            if (color == null) return;  // skip unnecessary entries
            Language.TextStrings weaponName = Language.getTextMapKey(data.getNameTextMapHash());
            for (int langIdx = 0; langIdx < NUM_LANGUAGES; langIdx++) {
                sbs.get(langIdx)
                        .append("\t\"")
                        .append(data.getId())
                        .append("\": [\"")
                        .append(weaponName.get(langIdx).replaceAll("\"", "\\\\\""))
                        .append(" (")
                        .append(WEAPON.get(langIdx))
                        .append(")\", \"")
                        .append(color)
                        .append("\"],\n");
            }
        });

        for (int langIdx = 0; langIdx < NUM_LANGUAGES; langIdx++) {
            sbs.get(langIdx)
                    .append("\t\"200\": \"")
                    .append(STANDARD_WISH.get(langIdx))
                    .append("\",\n\t\"301\": \"")
                    .append(CHARACTER_EVENT_WISH.get(langIdx))
                    .append("\",\n\t\"400\": \"")
                    .append(CHARACTER_EVENT_WISH_2.get(langIdx))
                    .append("\",\n\t\"302\": \"")
                    .append(WEAPON_EVENT_WISH.get(langIdx))
                    .append("\"\n}");
        }
        return sbs.stream().map(StringBuilder::toString).toList();
    }

    public static void createGachaMappings(Path location) throws IOException {
        ResourceLoader.loadResources();
        List<String> jsons = createGachaMappingJsons();
        var usedLocales = new HashSet<String>();
        StringBuilder sb = new StringBuilder("mappings = {\n");
        for (int i = 0; i < Language.TextStrings.NUM_LANGUAGES; i++) {
            String locale = Language.TextStrings.ARR_GC_LANGUAGES[i].toLowerCase();  // TODO: change the templates to not use lowercased locale codes
            if (usedLocales.add(locale)) {  // Some locales fallback to en-us, we don't want to redefine en-us with vietnamese strings
                sb.append("\t\"%s\": ".formatted(locale));
                sb.append(jsons.get(i).replace("\n", "\n\t") + ",\n");
            }
        }
        sb.setLength(sb.length() - 2);  // Delete trailing ",\n"
        sb.append("\n}");

        Files.createDirectories(location.getParent());
        Files.writeString(location, sb);
        Grasscutter.getLogger().info("Mappings generated to " + location);
    }

    public static List<String> getAvailableLanguage() {
        List<String> availableLangList = new ArrayList<>();
        try {
            Files.newDirectoryStream(getResourcePath("TextMap"), "TextMap*.json").forEach(path -> {
                availableLangList.add(path.getFileName().toString().replace("TextMap", "").replace(".json", "").toLowerCase());
            });
        } catch (IOException e) {
            Grasscutter.getLogger().error("Failed to get available languages:", e);
        }
        return availableLangList;
    }

    @Deprecated(forRemoval = true, since = "1.2.3")
    public static String getLanguageOption() {
        List<String> availableLangList = getAvailableLanguage();

        // Use system out for better format
        if (availableLangList.size() == 1) {
            return availableLangList.get(0).toUpperCase();
        }
        StringBuilder stagedMessage = new StringBuilder();
        stagedMessage.append("The following languages mappings are available, please select one: [default: EN] \n");

        StringBuilder groupedLangList = new StringBuilder(">\t"); String input;
        int groupedLangCount = 0;

        for (String availableLanguage: availableLangList) {
            groupedLangCount++;
            groupedLangList.append(availableLanguage).append("\t");

            if (groupedLangCount == 6) {
                stagedMessage.append(groupedLangList).append("\n");
                groupedLangCount = 0;
                groupedLangList = new StringBuilder(">\t");
            }
        }

        if (groupedLangCount > 0) {
            stagedMessage.append(groupedLangList).append("\n");
        }

        stagedMessage.append("\nYour choice: [EN] ");

        input = Grasscutter.getConsole().readLine(stagedMessage.toString());
        if (availableLangList.contains(input.toLowerCase())) {
            return input.toUpperCase();
        }

        Grasscutter.getLogger().info("Invalid option. Will use EN (English) as fallback."); return "EN";
    }
}
