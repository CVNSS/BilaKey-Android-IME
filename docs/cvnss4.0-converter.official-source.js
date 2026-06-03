const CVNSSConverter = (function () {
  // Bảng ánh xạ ký tự đặc biệt
  const specialChars = [
    "`", "“", "”", "<", ">", "@", "-", ";", "=", "…", " ", ",", ".", "?", "!",
    '"', "'", "(", ")", "[", "]", "{", "}", "%", "#", "$", "&", "_", "\\", "/",
    "*", ":", "+", "~", "^", "|", "\r\n", "\r", "\n"
  ];

  // Bảng ánh xạ phụ âm
  const consonants = {
    cqn: ["ngh", "ng", "ch", "gh", "kh", "nh", "ph", "th", "tr", "gi", "qu", "b", "k", "d", "đ", "g", "h", "c", "l", "m", "n", "r", "s", "t", "v", "x"],
    cvn: ["w", "w", "ch", "g", "k", "nh", "f", "th", "tr", "j", "q", "b", "c", "z", "d", "g", "h", "c", "l", "m", "n", "r", "s", "t", "v", "x"]
  };

  // Bảng ánh xạ nguyên âm
  const vowels = {
    cqn: [
      "a", "à", "ả", "ã", "á", "ạ", "oa", "òa", "ỏa", "õa", "óa", "ọa", "oà", "oả", "oã", "oá", "oạ", "oác", "oạc", "oách", "oạch",
      "oai", "oài", "oải", "oãi", "oái", "oại", "oao", "oào", "oảo", "oão", "oáo", "oạo", "oáp", "oạp", "oát", "oạt", "oắt", "oặt", "oắc", "oặc",
      "oăn", "oằn", "oẳn", "oẵn", "oắn", "oặn", "oăm", "oằm", "oẳm", "oẵm", "oắm", "oặm", "oăng", "oằng", "oẳng", "oẵng", "oắng", "oặng", "oay", "oày",
      "oảy", "oãy", "oáy", "oạy", "ác", "ạc", "ách", "ạch", "ai", "ài", "ải", "ãi", "ái", "ại", "am", "àm", "ảm", "ãm", "ám", "ạm", "an", "àn",
      "ản", "ãn", "án", "ạn", "oan", "oàn", "oản", "oãn", "oán", "oạn", "oanh", "oành", "oảnh", "oãnh", "oánh", "oạnh", "ang", "àng", "ảng", "ãng",
      "áng", "ạng", "oang", "oàng", "oảng", "oãng", "oáng", "oạng", "anh", "ành", "ảnh", "ãnh", "ánh", "ạnh", "ao", "ào", "ảo", "ão", "áo", "ạo",
      "áp", "ạp", "át", "ạt", "au", "àu", "ảu", "áu", "ạu", "ay", "ày", "ảy", "ãy", "áy", "ạy", "ắc", "ặc", "ăm", "ằm", "ẳm", "ẵm", "ắm", "ặm",
      "ăn", "ằn", "ẳn", "ẵn", "ắn", "ặn", "ăng", "ằng", "ẳng", "ẵng", "ắng", "ặng", "ắp", "ặp", "ắt", "ặt", "ấc", "ậc", "âm", "ầm", "ẩm", "ẫm",
      "ấm", "ậm", "ân", "ần", "ẩn", "ẫn", "ấn", "ận", "âng", "ầng", "ẩng", "ẫng", "ấng", "ậng", "uân", "uần", "uẩn", "uẫn", "uấn", "uận", "uâng",
      "uầng", "uẩng", "uẫng", "uấng", "uậng", "ấp", "ập", "ất", "ật", "uất", "uật", "âu", "ầu", "ẩu", "ẫu", "ấu", "ậu", "ây", "ầy", "ẩy", "ẫy",
      "ấy", "ậy", "uây", "uầy", "uẩy", "uẫy", "uấy", "uậy", "e", "è", "ẻ", "ẽ", "é", "ẹ", "oe", "òe", "ỏe", "õe", "óe", "ọe", "éc", "ẹc", "em",
      "èm", "ẻm", "ẽm", "ém", "ẹm", "en", "èn", "ẻn", "ẽn", "én", "ẹn", "oen", "oèn", "oẻn", "oẽn", "oén", "oẹn", "eng", "èng", "ẻng", "ẽng",
      "éng", "ẹng", "eo", "èo", "ẻo", "ẽo", "éo", "ẹo", "oeo", "oèo", "oẻo", "oẽo", "oéo", "oẹo", "ép", "ẹp", "ét", "ẹt", "oét", "oẹt", "ê",
      "ề", "ể", "ễ", "ế", "ệ", "uê", "uề", "uể", "uễ", "uế", "uệ", "ếch", "ệch", "uếch", "uệch", "êm", "ềm", "ểm", "ễm", "ếm", "ệm", "ên", "ền",
      "ển", "ễn", "ến", "ện", "ênh", "ềnh", "ểnh", "ễnh", "ếnh", "ệnh", "uênh", "uềnh", "uểnh", "uễnh", "uếnh", "uệnh", "ếp", "ệp", "ết", "ệt",
      "êu", "ều", "ểu", "ễu", "ếu", "ệu", "i", "ì", "ỉ", "ĩ", "í", "ị", "uy", "ùy", "ủy", "ũy", "úy", "ụy", "uỳ", "uỷ", "uỹ", "uý", "uỵ", "ia",
      "ìa", "ỉa", "ĩa", "ía", "ịa", "uya", "íc", "ích", "ịch", "uých", "uỵch", "iếc", "iệc", "iêm", "iềm", "iểm", "iễm", "iếm", "iệm", "iên",
      "iền", "iển", "iễn", "iến", "iện", "uyên", "uyền", "uyển", "uyễn", "uyến", "uyện", "iêng", "iềng", "iểng", "iễng", "iếng", "iệng", "iếp",
      "iệp", "iết", "iệt", "uyết", "uyệt", "iêu", "iều", "iểu", "iễu", "iếu", "iệu", "yêt", "yệt", "yên", "yền", "yển", "yễn", "yến", "yện",
      "yêm", "yềm", "yểm", "yễm", "yếm", "yệm", "yêng", "yềng", "yểng", "yễng", "yếng", "yệnh", "yêu", "yều", "yểu", "yễu", "yếu", "yệu", "im",
      "ìm", "ỉm", "ĩm", "ím", "ịm", "in", "ìn", "ỉn", "ĩn", "ín", "ịn", "inh", "ình", "ỉnh", "ĩnh", "ính", "ịnh", "uynh", "uỳnh", "uỷnh", "uỹnh",
      "uýnh", "uỵnh", "íp", "ịp", "uýp", "uỵp", "ít", "ịt", "uýt", "uỵt", "iu", "ìu", "ỉu", "ĩu", "íu", "ịu", "uyu", "uỳu", "uỷu", "uỹu", "uýu",
      "uỵu", "uỳn", "uỷn", "uỹn", "uýn", "uỵn", "o", "ò", "ỏ", "õ", "ó", "ọ", "óc", "ọc", "oi", "òi", "ỏi", "õi", "ói", "ọi", "om", "òm", "ỏm",
      "õm", "óm", "ọm", "on", "òn", "ỏn", "õn", "ón", "ọn", "ong", "òng", "ỏng", "õng", "óng", "ọng", "oóc", "oong", "oòng", "oỏng", "oõng",
      "oóng", "oòng", "oọng", "óp", "ọp", "ót", "ọt", "ô", "ồ", "ổ", "ỗ", "ố", "ộ", "ốc", "ộc", "ôi", "ồi", "ổi", "ỗi", "ối", "ội", "ôm", "ồm",
      "ổm", "ỗm", "ốm", "ộm", "ôn", "ồn", "ổn", "ỗn", "ốn", "ộn", "ông", "ồng", "ổng", "ỗng", "ống", "ộng", "ốp", "ộp", "ốt", "ột", "ơ", "ờ",
      "ở", "ỡ", "ớ", "ợ", "ơi", "ời", "ởi", "ỡi", "ới", "ợi", "ơm", "ờm", "ởm", "ỡm", "ớm", "ợm", "ơn", "ờn", "ởn", "ỡn", "ớn", "ợn", "ơng",
      "ờng", "ởng", "ỡng", "ớng", "ợng", "ớp", "ợp", "ớt", "ợt", "u", "ù", "ủ", "ũ", "ú", "ụ", "ua", "ùa", "ủa", "ũa", "úa", "ụa", "úc", "ục",
      "ui", "ùi", "ủi", "ũi", "úi", "ụi", "um", "ùm", "ủm", "ũm", "úm", "ụm", "un", "ùn", "ủn", "ũn", "ún", "ụn", "ung", "ùng", "ủng", "ũng",
      "úng", "ụng", "uơ", "uờ", "uở", "uỡ", "uớ", "uợ", "uơn", "uờn", "uởn", "uỡn", "uớn", "uợn", "uớt", "uợt", "uốc", "uộc", "uôi", "uồi", "uổi",
      "uỗi", "uối", "uội", "uôm", "uồm", "uổm", "uỗm", "uốm", "uộm", "uôn", "uồn", "uổn", "uỗn", "uốn", "uộn", "uông", "uồng", "uổng", "uỗng",
      "uống", "uộng", "uốt", "uột", "uốp", "uộp", "úp", "ụp", "út", "ụt", "ư", "ừ", "ử", "ữ", "ứ", "ự", "ưa", "ừa", "ửa", "ữa", "ứa", "ựa",
      "ức", "ực", "ưi", "ừi", "ửi", "ữi", "ứi", "ựi", "ưm", "ừm", "ửm", "ữm", "ứm", "ựm", "ưn", "ừn", "ửn", "ữn", "ứn", "ựn", "ưng", "ừng",
      "ửng", "ững", "ứng", "ựng", "ước", "ược", "ươi", "ười", "ưởi", "ưỡi", "ưới", "ượi", "ươm", "ườm", "ưởm", "ưỡm", "ướm", "ượm", "ươn",
      "ườn", "ưởn", "ưỡn", "ướn", "ượn", "ương", "ường", "ưởng", "ưỡng", "ướng", "ượng", "ướp", "ượp", "ướt", "ượt", "ươu", "ườu", "ưởu",
      "ưỡu", "ướu", "ượu", "ứt", "ựt", "ưu", "ừu", "ửu", "ữu", "ứu", "ựu", "y", "ỳ", "ỷ", "ỹ", "ý", "ỵ", "ỳa", "ỷa", "ỹa", "ýa", "ỵa"
    ],
    cvn: [
      "a", "al", "az", "as", "aj", "ar", "oa", "oal", "oaz", "oas", "oaj", "oar", "oal", "oaz", "oas", "oaj", "oar", "osj", "osr", "oakj", "oakr",
      "ojp", "ojl", "ojz", "ojs", "ojj", "ojr", "owp", "owl", "owz", "ows", "owj", "owr", "ofj", "ofr", "odj", "odr", "adx", "adh", "asx", "ash",
      "alo", "alk", "alv", "alw", "alx", "alh", "avo", "avk", "avv", "avw", "avx", "avh", "azo", "azk", "azv", "azw", "azx", "azh", "ajp", "ajl",
      "ajz", "ajs", "ajj", "ajr", "ac", "acr", "akj", "akr", "ai", "ail", "aiz", "ais", "aij", "air", "am", "aml", "amz", "ams", "amj", "amr",
      "an", "anl", "anz", "ans", "anj", "anr", "olp", "oll", "olz", "ols", "olj", "olr", "oahp", "oahl", "oahz", "oahs", "oahj", "oahr", "agp",
      "agl", "agz", "ags", "agj", "agr", "ozp", "ozl", "ozz", "ozs", "ozj", "ozr", "ahp", "ahl", "ahz", "ahs", "ahj", "ahr", "ao", "aol", "aoz",
      "aos", "aoj", "aor", "ap", "apr", "at", "atr", "au", "aul", "auz", "auj", "aur", "ay", "ayl", "ayz", "ays", "ayj", "ayr", "acx", "ach",
      "amo", "amk", "amv", "amw", "amx", "amh", "ano", "ank", "anv", "anw", "anx", "anh", "ago", "agk", "agv", "agw", "agx", "agh", "apx", "aph",
      "atx", "ath", "acb", "acf", "amy", "amd", "amq", "amg", "amb", "amf", "any", "and", "anq", "ang", "anb", "anf", "agy", "agd", "agq", "agg",
      "agb", "agf", "aly", "ald", "alq", "alg", "alb", "alf", "azy", "azd", "azq", "azg", "azb", "azf", "apb", "apf", "atb", "atf", "adb", "adf",
      "auy", "aud", "auq", "aug", "aub", "auf", "ayy", "ayd", "ayq", "ayg", "ayb", "ayf", "ajy", "ajd", "ajq", "ajg", "ajb", "ajf", "e", "el",
      "ez", "es", "ej", "er", "oe", "oel", "oez", "oes", "oej", "oer", "ec", "ecr", "em", "eml", "emz", "ems", "emj", "emr", "en", "enl", "enz",
      "ens", "enj", "enr", "elp", "ell", "elz", "els", "elj", "elr", "egp", "egl", "egz", "egs", "egj", "egr", "eo", "eol", "eoz", "eos", "eoj",
      "eor", "ewp", "ewl", "ewz", "ews", "ewj", "ewr", "ep", "epr", "et", "etr", "edj", "edr", "ey", "ed", "eq", "eg", "eb", "ef", "uey", "ued",
      "ueq", "ueg", "ueb", "uef", "ekb", "ekf", "uekb", "uekf", "emy", "emd", "emq", "emg", "emb", "emf", "eny", "end", "enq", "eng", "enb", "enf",
      "ehy", "ehd", "ehq", "ehg", "ehb", "ehf", "uehy", "uehd", "uehq", "uehg", "uehb", "uehf", "epb", "epf", "etb", "etf", "euy", "eud", "euq",
      "eug", "eub", "euf", "i", "il", "iz", "is", "ij", "ir", "y", "yl", "yz", "ys", "yj", "yr", "yl", "yz", "ys", "yj", "yr", "ia", "ial", "iaz",
      "ias", "iaj", "iar", "ya", "ic", "ikj", "ikr", "ykj", "ykr", "isb", "isf", "ivy", "ivd", "ivq", "ivg", "ivb", "ivf", "ily", "ild", "ilq",
      "ilg", "ilb", "ilf", "yly", "yld", "ylq", "ylg", "ylb", "ylf", "izy", "izd", "izq", "izg", "izb", "izf", "ifb", "iff", "idb", "idf", "ydb",
      "ydf", "iwy", "iwd", "iwq", "iwg", "iwb", "iwf", "idb", "idf", "ily", "ild", "ilq", "ilg", "ilb", "ilf", "ivy", "ivd", "ivq", "ivg", "ivb",
      "ivf", "izy", "izd", "izq", "izg", "izb", "izf", "iwy", "iwd", "iwq", "iwg", "iwb", "iwf", "im", "iml", "imz", "ims", "imj", "imr", "in",
      "inl", "inz", "ins", "inj", "inr", "ihp", "ihl", "ihz", "ihs", "ihj", "ihr", "yhp", "yhl", "yhz", "yhs", "yhj", "yhr", "ip", "ipr", "yp",
      "ypr", "it", "itr", "yt", "ytr", "iu", "iul", "iuz", "ius", "iuj", "iur", "yu", "yul", "yuz", "yus", "yuj", "yur", "ynl", "ynz", "yns",
      "ynj", "ynr", "o", "ol", "oz", "os", "oj", "or", "oc", "ocr", "oi", "oil", "oiz", "ois", "oij", "oir", "om", "oml", "omz", "oms", "omj",
      "omr", "on", "onl", "onz", "ons", "onj", "onr", "ogp", "ogl", "ogz", "ogs", "ogj", "ogr", "ooc", "oog", "oogl", "oogz", "oogs", "oogj",
      "oogl", "oogr", "op", "opr", "ot", "otr", "oy", "od", "oq", "og", "ob", "of", "ocb", "ocf", "oiy", "oid", "oiq", "oig", "oib", "oif",
      "omy", "omd", "omq", "omg", "omb", "omf", "ony", "ond", "onq", "ong", "onb", "onf", "ogy", "ogd", "ogq", "ogg", "ogb", "ogf", "opb",
      "opf", "otb", "otf", "oo", "ok", "ov", "ow", "ox", "oh", "oio", "oik", "oiv", "oiw", "oix", "oih", "omo", "omk", "omv", "omw", "omx",
      "omh", "ono", "onk", "onv", "onw", "onx", "onh", "ogo", "ogk", "ogv", "ogw", "ogx", "ogh", "opx", "oph", "otx", "oth", "u", "ul", "uz",
      "us", "uj", "ur", "ua", "ual", "uaz", "uas", "uaj", "uar", "uc", "ucr", "ui", "uil", "uiz", "uis", "uij", "uir", "um", "uml", "umz", "ums",
      "umj", "umr", "un", "unl", "unz", "uns", "unj", "unr", "ugp", "ugl", "ugz", "ugs", "ugj", "ugr", "uoo", "uok", "uov", "uow", "uox", "uoh",
      "olo", "olk", "olv", "olw", "olx", "olh", "odx", "odh", "usb", "usf", "ujy", "ujd", "ujq", "ujg", "ujb", "ujf", "uvy", "uvd", "uvq", "uvg",
      "uvb", "uvf", "uly", "uld", "ulq", "ulg", "ulb", "ulf", "uzy", "uzd", "uzq", "uzg", "uzb", "uzf", "udb", "udf", "ufb", "uff", "up", "upr",
      "ut", "utr", "uo", "uk", "uv", "uw", "ux", "uh", "uao", "uak", "uav", "uaw", "uax", "uah", "ucx", "uch", "uio", "uik", "uiv", "uiw", "uix",
      "uih", "umo", "umk", "umv", "umw", "umx", "umh", "uno", "unk", "unv", "unw", "unx", "unh", "ugo", "ugk", "ugv", "ugw", "ugx", "ugh", "usx",
      "ush", "ujo", "ujk", "ujv", "ujw", "ujx", "ujh", "uvo", "uvk", "uvv", "uvw", "uvx", "uvh", "ulo", "ulk", "ulv", "ulw", "ulx", "ulh", "uzo",
      "uzk", "uzv", "uzw", "uzx", "uzh", "ufx", "ufh", "udx", "udh", "uwo", "uwk", "uwv", "uww", "uwx", "uwh", "utx", "uth", "uuo", "uuk", "uuv",
      "uuw", "uux", "uuh", "i", "il", "iz", "is", "ij", "ir", "ial", "iaz", "ias", "iaj", "iar"
    ],
    cvss: [
      "a", "al", "az", "as", "aj", "ar", "oa", "oal", "oaz", "oas", "oaj", "oar", "oal", "oaz", "oas", "oaj", "oar", "osj", "osr", "oakj", "oakr",
      "ojp", "ojl", "ojz", "ojs", "ojj", "ojr", "owp", "owl", "owz", "ows", "owj", "owr", "ofj", "ofr", "odj", "odr", "adx", "adh", "asx", "ash",
      "alo", "alk", "alv", "alw", "alx", "alh", "avo", "avk", "avv", "avw", "avx", "avh", "azo", "azk", "azv", "azw", "azx", "azh", "ajp", "ajl",
      "ajz", "ajs", "ajj", "ajr", "ac", "acr", "akj", "akr", "ai", "ail", "aiz", "ais", "aij", "air", "am", "aml", "amz", "ams", "amj", "amr",
      "an", "anl", "anz", "ans", "anj", "anr", "olp", "oll", "olz", "ols", "olj", "olr", "oahp", "oahl", "oahz", "oahs", "oahj", "oahr", "agp",
      "agl", "agz", "ags", "agj", "agr", "ozp", "ozl", "ozz", "ozs", "ozj", "ozr", "ahp", "ahl", "ahz", "ahs", "ahj", "ahr", "ao", "aol", "aoz",
      "aos", "aoj", "aor", "ap", "apr", "at", "atr", "au", "aul", "auz", "auj", "aur", "ay", "ayl", "ayz", "ays", "ayj", "ayr", "acx", "ach",
      "amo", "amk", "amv", "amw", "amx", "amh", "ano", "ank", "anv", "anw", "anx", "anh", "ago", "agk", "agv", "agw", "agx", "agh", "apx", "aph",
      "atx", "ath", "acb", "acf", "amy", "amd", "amq", "amg", "amb", "amf", "any", "and", "anq", "ang", "anb", "anf", "agy", "agd", "agq", "agg",
      "agb", "agf", "aly", "ald", "alq", "alg", "alb", "alf", "azy", "azd", "azq", "azg", "azb", "azf", "apb", "apf", "atb", "atf", "adb", "adf",
      "auy", "aud", "auq", "aug", "aub", "auf", "ayy", "ayd", "ayq", "ayg", "ayb", "ayf", "ajy", "ajd", "ajq", "ajg", "ajb", "ajf", "e", "el",
      "ez", "es", "ej", "er", "oe", "oel", "oez", "oes", "oej", "oer", "ec", "ecr", "em", "eml", "emz", "ems", "emj", "emr", "en", "enl", "enz",
      "ens", "enj", "enr", "elp", "ell", "elz", "els", "elj", "elr", "egp", "egl", "egz", "egs", "egj", "egr", "eo", "eol", "eoz", "eos", "eoj",
      "eor", "ewp", "ewl", "ewz", "ews", "ewj", "ewr", "ep", "epr", "et", "etr", "edj", "edr", "ey", "ed", "eq", "eg", "eb", "ef", "uey", "ued",
      "ueq", "ueg", "ueb", "uef", "ekb", "ekf", "uekb", "uekf", "emy", "emd", "emq", "emg", "emb", "emf", "eny", "end", "enq", "eng", "enb", "enf",
      "ehy", "ehd", "ehq", "ehg", "ehb", "ehf", "uehy", "uehd", "uehq", "uehg", "uehb", "uehf", "epb", "epf", "etb", "etf", "euy", "eud", "euq",
      "eug", "eub", "euf", "i", "il", "iz", "is", "ij", "ir", "y", "yl", "yz", "ys", "yj", "yr", "yl", "yz", "ys", "yj", "yr", "ia", "ial", "iaz",
      "ias", "iaj", "iar", "ya", "ic", "ikj", "ikr", "ykj", "ykr", "isb", "isf", "ivy", "ivd", "ivq", "ivg", "ivb", "ivf", "ily", "ild", "ilq",
      "ilg", "ilb", "ilf", "yly", "yld", "ylq", "ylg", "ylb", "ylf", "izy", "izd", "izq", "izg", "izb", "izf", "ifb", "iff", "idb", "idf", "ydb",
      "ydf", "iwy", "iwd", "iwq", "iwg", "iwb", "iwf", "idb", "idf", "ily", "ild", "ilq", "ilg", "ilb", "ilf", "ivy", "ivd", "ivq", "ivg", "ivb",
      "ivf", "izy", "izd", "izq", "izg", "izb", "izf", "iwy", "iwd", "iwq", "iwg", "iwb", "iwf", "im", "iml", "imz", "ims", "imj", "imr", "in",
      "inl", "inz", "ins", "inj", "inr", "ihp", "ihl", "ihz", "ihs", "ihj", "ihr", "yhp", "yhl", "yhz", "yhs", "yhj", "yhr", "ip", "ipr", "yp",
      "ypr", "it", "itr", "yt", "ytr", "iu", "iul", "iuz", "ius", "iuj", "iur", "yu", "yul", "yuz", "yus", "yuj", "yur", "ynl", "ynz", "yns",
      "ynj", "ynr", "o", "ol", "oz", "os", "oj", "or", "oc", "ocr", "oi", "oil", "oiz", "ois", "oij", "oir", "om", "oml", "omz", "oms", "omj",
      "omr", "on", "onl", "onz", "ons", "onj", "onr", "ogp", "ogl", "ogz", "ogs", "ogj", "ogr", "ooc", "oog", "oogl", "oogz", "oogs", "oogj",
      "oogl", "oogr", "op", "opr", "ot", "otr", "oy", "od", "oq", "og", "ob", "of", "ocb", "ocf", "oiy", "oid", "oiq", "oig", "oib", "oif",
      "omy", "omd", "omq", "omg", "omb", "omf", "ony", "ond", "onq", "ong", "onb", "onf", "ogy", "ogd", "ogq", "ogg", "ogb", "ogf", "opb",
      "opf", "otb", "otf", "oo", "ok", "ov", "ow", "ox", "oh", "oio", "oik", "oiv", "oiw", "oix", "oih", "omo", "omk", "omv", "omw", "omx",
      "omh", "ono", "onk", "onv", "onw", "onx", "onh", "ogo", "ogk", "ogv", "ogw", "ogx", "ogh", "opx", "oph", "otx", "oth", "u", "ul", "uz",
      "us", "uj", "ur", "ua", "ual", "uaz", "uas", "uaj", "uar", "uc", "ucr", "ui", "uil", "uiz", "uis", "uij", "uir", "um", "uml", "umz", "ums",
      "umj", "umr", "un", "unl", "unz", "uns", "unj", "unr", "ugp", "ugl", "ugz", "ugs", "ugj", "ugr", "uoo", "uok", "uov", "uow", "uox", "uoh",
      "olo", "olk", "olv", "olw", "olx", "olh", "odx", "odh", "usb", "usf", "ujy", "ujd", "ujq", "ujg", "ujb", "ujf", "uvy", "uvd", "uvq", "uvg",
      "uvb", "uvf", "uly", "uld", "ulq", "ulg", "ulb", "ulf", "uzy", "uzd", "uzq", "uzg", "uzb", "uzf", "udb", "udf", "ufb", "uff", "up", "upr",
      "ut", "utr", "uo", "uk", "uv", "uw", "ux", "uh", "uao", "uak", "uav", "uaw", "uax", "uah", "ucx", "uch", "uio", "uik", "uiv", "uiw", "uix",
      "uih", "umo", "umk", "umv", "umw", "umx", "umh", "uno", "unk", "unv", "unw", "unx", "unh", "ugo", "ugk", "ugv", "ugw", "ugx", "ugh", "usx",
      "ush", "ujo", "ujk", "ujv", "ujw", "ujx", "ujh", "uvo", "uvk", "uvv", "uvw", "uvx", "uvh", "ulo", "ulk", "ulv", "ulw", "ulx", "ulh", "uzo",
      "uzk", "uzv", "uzw", "uzx", "uzh", "ufx", "ufh", "udx", "udh", "uwo", "uwk", "uwv", "uww", "uwx", "uwh", "utx", "uth", "uuo", "uuk", "uuv",
      "uuw", "uux", "uuh", "i", "il", "iz", "is", "ij", "ir", "ial", "iaz", "ias", "iaj", "iar"
    ]
  };

  // Bảng ánh xạ nguyên âm cơ bản
  const baseVowels = [
    "aàảãáạ", "ăằẳẵắặ", "âầẩẫấậ", "eèẻẽéẹ", "êềểễếệ", "iìỉĩíị",
    "oòỏõóọ", "ôồổỗốộ", "ơờởỡớợ", "uùủũúụ", "ưừửữứự", "yỳỷỹýỵ"
  ];

  // Bảng ánh xạ thay thế đặc biệt
  const specialReplacements = {
    y: "yỳỷỹýỵ",
    i: "iìỉĩíị"
  };

  // Quy tắc điều chỉnh phụ âm
  const consonantAdjustments = {
    phu_am: ["ngh", "gh", "k"],
    phu_am_chuyen_doi: ["ng", "g", "c"],
    nguyen_am: "ieê"
  };

  // Hàm kiểm tra chữ in hoa
  function isUpperCase(str) {
    return /^[A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ]+$/.test(str);
  }

  // Hàm lấy nguyên âm cơ bản
  function getBaseVowel(char) {
    for (const vowelGroup of baseVowels) {
      if (vowelGroup.includes(char)) return vowelGroup[0];
    }
    return char;
  }

  // Hàm tách chuỗi thành token
  function splitString(str) {
    str = str.normalize("NFC");
    const tokens = str.split(/([\s|,|;|`|@|<|>|“|”|.|=|…|?|!|\\|'|"|(|)|[|\]|{|}|%|#|$|&|\-|_|/|*|:|+|~|^|||\r\n|\n|\r])/gm);
    return tokens.filter(token => token !== "");
  }

  // Hàm điều chỉnh phụ âm và nguyên âm
  function adjustConsonantVowel(cqnPad, cqnVan) {
    const firstChar = cqnVan[0] || "";
    if (cqnPad === "qu" && getBaseVowel(firstChar) === "u") {
      cqnPad = "q";
    }
    if (!cqnPad && getBaseVowel(firstChar) === "i") {
      cqnVan = cqnVan.replace(firstChar, specialReplacements.y[specialReplacements.i.indexOf(firstChar)]);
    }
    if (cqnPad === "gi" && getBaseVowel(firstChar) === "i") {
      cqnPad = "g";
    }
    if (consonantAdjustments.phu_am.includes(cqnPad) && !consonantAdjustments.nguyen_am.includes(getBaseVowel(firstChar))) {
      cqnPad = consonantAdjustments.phu_am_chuyen_doi[consonantAdjustments.phu_am.indexOf(cqnPad)];
    }
    return { cqnPad, cqnVan };
  }

  // Hàm chuyển từ CQN sang CVN và CVSS
  function cqnToCvnAndCvss(word) {
    const lowerWord = word.toLowerCase();
    let consonant = "", vowelPart = lowerWord, cvnConsonant = "", cqnResult = "", cvnResult = "", cvssResult = "";
    
    // Tìm phụ âm
    for (const c of consonants.cqn) {
      if (lowerWord.startsWith(c)) {
        consonant = c;
        vowelPart = lowerWord.replace(c, "");
        break;
      }
    }

    // Điều chỉnh đặc biệt
    if (consonant === "gi" && vowelPart !== "a" && vowels.cqn.includes("i" + vowelPart)) {
      vowelPart = "i" + vowelPart;
    }
    if (consonant === "qu" && getBaseVowel(vowelPart[0]) === "y") {
      vowelPart = "u" + vowelPart;
    }
    if (consonant === "g" && getBaseVowel(vowelPart[0]) === "i") {
      consonant = "gi";
    }

    // Ánh xạ phụ âm
    cvnConsonant = consonants.cqn.includes(consonant) ? consonants.cvn[consonants.cqn.indexOf(consonant)] : consonant;

    // Ánh xạ nguyên âm
    const vowelIndex = vowels.cqn.indexOf(vowelPart);
    if (vowelIndex !== -1) {
      cqnResult = vowelPart;
      cvnResult = vowels.cvn[vowelIndex];
      cvssResult = vowels.cvss[vowelIndex];
    } else {
      cqnResult = vowelPart;
      cvnResult = vowelPart;
      cvssResult = vowelPart;
    }

    // Kết hợp kết quả
    let cvnOutput = cvnConsonant + cvnResult;
    let cvssOutput = cvnConsonant + cvssResult;

    // Xử lý chữ hoa
    if (word[0] !== word[0].toLowerCase()) {
      if (cqnResult.length) cqnResult = cqnResult[0].toUpperCase() + cqnResult.slice(1);
      if (cvnOutput.length) cvnOutput = cvnOutput[0].toUpperCase() + cvnOutput.slice(1);
      if (cvssOutput.length) cvssOutput = cvssOutput[0].toUpperCase() + cvssOutput.slice(1);
    }
    if (isUpperCase(word)) {
      cqnResult = cqnResult.toUpperCase();
      cvnOutput = cvnOutput.toUpperCase();
      cvssOutput = cvssOutput.toUpperCase();
    }

    return { cqn: cqnResult, cvn: cvnOutput, cvss: cvssOutput };
  }

  // Hàm chuyển từ CVN sang CQN và CVSS
  function cvnToCqnAndCvss(word) {
    const lowerWord = word.toLowerCase();
    let consonant = "", vowelPart = lowerWord, cqnConsonant = "", cqnResult = "", cvnResult = "", cvssResult = "";

    // Tìm phụ âm
    for (const c of consonants.cvn) {
      if (lowerWord.startsWith(c)) {
        consonant = c;
        cqnConsonant = consonants.cqn[consonants.cvn.indexOf(c)];
        vowelPart = lowerWord.replace(c, "");
        break;
      }
    }

    // Ánh xạ nguyên âm
    const vowelIndex = vowels.cvn.indexOf(vowelPart);
    if (vowelIndex !== -1) {
      cqnResult = vowels.cqn[vowelIndex];
      cvnResult = vowelPart;
      cvssResult = vowels.cvss[vowelIndex];
    } else {
      cqnResult = vowelPart;
      cvnResult = vowelPart;
      cvssResult = vowelPart;
    }

    // Điều chỉnh đặc biệt
    if (consonant === "j" && vowelPart === "ịa") {
      cqnConsonant = "gi";
      cqnResult = "ỵa";
    }

    // Điều chỉnh phụ âm và nguyên âm
    const adjusted = adjustConsonantVowel(cqnConsonant, cqnResult);
    cqnConsonant = adjusted.cqnPad;
    cqnResult = adjusted.cqnVan;

    // Kết hợp kết quả
    let cqnOutput = cqnConsonant + cqnResult;
    let cvssOutput = consonant + cvssResult;

    // Xử lý chữ hoa
    if (word[0] !== word[0].toLowerCase()) {
      if (cqnOutput.length) cqnOutput = cqnOutput[0].toUpperCase() + cqnOutput.slice(1);
      if (cvnResult.length) cvnResult = cvnResult[0].toUpperCase() + cvnResult.slice(1);
      if (cvssOutput.length) cvssOutput = cvssOutput[0].toUpperCase() + cvssOutput.slice(1);
    }
    if (isUpperCase(word)) {
      cqnOutput = cqnOutput.toUpperCase();
      cvnResult = cvnResult.toUpperCase();
      cvssOutput = cvssOutput.toUpperCase();
    }

    return { cqn: cqnOutput, cvn: cvnResult, cvss: cvssOutput };
  }

  // Hàm chuyển từ CVSS sang CQN và CVN
  function cvssToCqnAndCvn(word) {
    const lowerWord = word.toLowerCase();
    let consonant = "", vowelPart = lowerWord, cqnConsonant = "", cqnResult = "", cvnResult = "", cvssResult = "";

    // Tìm phụ âm
    for (const c of consonants.cvn) {
      if (lowerWord.startsWith(c)) {
        consonant = c;
        cqnConsonant = consonants.cqn[consonants.cvn.indexOf(c)];
        vowelPart = lowerWord.replace(c, "");
        break;
      }
    }

    // Ánh xạ nguyên âm
    const vowelIndex = vowels.cvss.indexOf(vowelPart);
    if (vowelIndex !== -1) {
      cqnResult = vowels.cqn[vowelIndex];
      cvnResult = vowels.cvn[vowelIndex];
      cvssResult = vowelPart;
    } else {
      cqnResult = vowelPart;
      cvnResult = vowelPart;
      cvssResult = vowelPart;
    }

    // Điều chỉnh đặc biệt
    if (consonant === "j" && vowelPart === "iar") {
      cqnConsonant = "gi";
      cqnResult = "ỵa";
    }
    if (lowerWord === "it") {
      cqnResult = "ít";
    }
    if (lowerWord === "ikj") {
      cqnResult = "ích";
    }

    // Điều chỉnh phụ âm và nguyên âm
    const adjusted = adjustConsonantVowel(cqnConsonant, cqnResult);
    cqnConsonant = adjusted.cqnPad;
    cqnResult = adjusted.cqnVan;

    // Kết hợp kết quả
    let cqnOutput = cqnConsonant + cqnResult;
    let cvnOutput = consonant + cvnResult;

    // Xử lý chữ hoa
    if (word[0] !== word[0].toLowerCase()) {
      if (cqnOutput.length) cqnOutput = cqnOutput[0].toUpperCase() + cqnOutput.slice(1);
      if (cvnOutput.length) cvnOutput = cvnOutput[0].toUpperCase() + cvnOutput.slice(1);
      if (cvssResult.length) cvssResult = cvssResult[0].toUpperCase() + cvssResult.slice(1);
    }
    if (isUpperCase(word)) {
      cqnOutput = cqnOutput.toUpperCase();
      cvnOutput = cvnOutput.toUpperCase();
      cvssResult = cvssResult.toUpperCase();
    }

    return { cqn: cqnOutput, cvn: cvnOutput, cvss: cvssResult };
  }

  // Hàm chuyển đổi toàn bộ văn bản
  function convertText(input, mode) {
    const tokens = splitString(input);
    const result = { cqn: [], cvn: [], cvss: [] };

    tokens.forEach(token => {
      if (specialChars.includes(token)) {
        result.cqn.push(token);
        result.cvn.push(token);
        result.cvss.push(token);
      } else {
        let converted;
        if (mode === "cqn") {
          converted = cqnToCvnAndCvss(token);
        } else if (mode === "cvn") {
          converted = cvnToCqnAndCvss(token);
        } else if (mode === "cvss") {
          converted = cvssToCqnAndCvn(token);
        }
        result.cqn.push(converted.cqn);
        result.cvn.push(converted.cvn);
        result.cvss.push(converted.cvss);
      }
    });

    return {
      cqn: result.cqn.join(""),
      cvn: result.cvn.join(""),
      cvss: result.cvss.join("")
    };
  }

  // Xuất module
  return {
    convert: convertText,
    specialChars
  };
})();

// Xuất module cho môi trường Node.js hoặc trình duyệt
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = CVNSSConverter;
} else {
  window.CVNSSConverter = CVNSSConverter;
}