// Questions Database - Support for 100+ questions
// Each question has: question text, options array, and correctAnswer index

const quizQuestions = [
    {
        question: "ما الهدف الأساسي من البيئة الافتراضية؟",
        options: ["زيادة سرعة المعالج","عزل حزم المشروع عن النظام"," تحسين جودة الشاشة","حماية الجهاز من الفيروسات "],
        correctAnswer: 1
    },
    {
        question: "أي أداة مدمجة في بايثون لإنشاء بيئات افتراضية؟",
        options: ["Pipenv", "conda", "venv", "docker"],
        correctAnswer: 2
    },
    {
        question: "venv ما الأمر لإنشاء بيئة افتراضية باستخدام",
        options: ["python -m virtualenv env","python make env","python -m venv env","py install env"],
        correctAnswer: 2
    },
  
    {
        question: "ما الأمر لتفعيل البيئة الافتراضية في ويندوز؟",
        options: ["source env/bin/activate","activate env","env-Scripts-activate","env.activate"],
        correctAnswer: 2
    },

    {
        question: "ما الأمر لإلغاء تفعيل البيئة الافتراضية؟",
        options: ["Quit","deactivate","close env","stop-env"],
        correctAnswer: 1
    },

    {
        question: "أين يتم تخزين الحزم عند تثبيتها داخل بيئة افتراضية؟",
        options: ["داخل النظام الرئيسي","داخل نظام التشغيل","داخل مجلد البيئة نفسها","داخل مجلد المستخدم"],
        correctAnswer: 2
    },

    {
        question: "ما فائدة ملف requirements.txt؟",
        options: ["حذف الحزم","تثبيت إصدار محدّث من بايثون","حفظ قائمة الحزم للمشاركة أو التثبيت لاحقًا","انشاء بيئة جديدة تلقائيًا"],
        correctAnswer: 2
    },

    {
        question: "ما الأمر لتثبيت الحزم من ملف requirements.txt؟",
        options: ["pip install file.txt","pip load requirements.txt","pip install -r requirements.txt","pip get requirements"],
        correctAnswer: 2
    },

    {
        question: "أي مما يلي يعتبر ميزة للبيئات الافتراضية؟",
        options: ["مشاركة جميع المشاريع نفس الحزم","اختلاف إصدار الحزم بين المشاريع بدون مشاكل","زيادة مساحة التخزين","تسريع الحاسوب"],
        correctAnswer: 1
    },

    {
        question: "ما الأمر لعرض الحزم المثبتة في البيئة؟",
        options: ["pip show","pip list","pip install","pip display"],
        correctAnswer: 1
    },

    {
        question: "أي من التالي ليس نظامًا لإدارة البيئات؟",
        options: ["Venv","conda","virtualenv","sudo"],
        correctAnswer: 3
    },

    {
        question: "الأمر الصحيح لإنشاء بيئة باستخدام virtualenv؟",
        options: ["virtualenv env","create env","venv virtual","new virtual"],
        correctAnswer: 0
    },

    {
        question: "ما الامتداد الافتراضي لملف تفعيل البيئة في Linux؟",
        options: [".exe",".bin",".sh",".run"],
        correctAnswer: 2
    },

    {
        question: "في conda، ما الأمر لإنشاء بيئة جديدة؟",
        options: ["conda new","conda create --name env","conda build env","conda start env"],
        correctAnswer: 1
    },

    {
        question: "ما الأمر لحذف بيئة conda؟",
        options: ["conda remove env","conda delete env","conda uninstall env","conda env remove"],
        correctAnswer: 3
    },

    {
        question: "ما المقصود بـ Isolation في البيئات الافتراضية؟",
        options: ["منع استخدام الإنترنت","عزل الحزم عن النظام والمشاريع الأخرى","تغيير مكان التخزين","حماية البيانات"],
        correctAnswer: 1
    },

    {
        question: "هل تحتاج البيئة الافتراضية لحقوق المدير (Admin) لإنشاءها؟",
        options: ["نعم","لا","فقط في Linux","فقط في Windows"],
        correctAnswer: 1
    },

    {
        question: "أي أمر يستخدم لمعرفة مسار البيئة المفعلة؟",
        options: ["pip path","python --where","which python","env-path"],
        correctAnswer: 2
    },

    {
        question: "ما معنى العبارة (env/bin/python)؟",
        options: ["بايثون النظام","بايثون داخل البيئة","محرّك قاعدة البيانات","ملف مؤقت"],
        correctAnswer: 1
    },

    {
        question: "ما الأمر لإنشاء ملف requirements تلقائيًا؟",
        options: ["pip make","pip export","pip freeze > requirements.txt","pip list save"],
        correctAnswer: 2
    },

    {
        question: "عند استخدام بيئة افتراضية، يقوم pip بالتثبيت في",
        options: ["النظام الرئيسي","مجلد المشروع الخارجي","البيئة فقط","السحابة"],
        correctAnswer: 2
    },

    {
        question: "هل يمكن أن تحتوي البيئة الواحدة على عدة إصدارات من نفس الحزمة؟",
        options: ["نعم","لا"],
        correctAnswer: 1
    },

    {
        question: "ما الهدف من virtualenv مقارنة بـ venv؟",
        options: ["يعمل على بايثون ≥ 3.3 فقط","يوفر توافقًا مع إصدارات أقدم من بايثون","بطيء أكثر","غير مدعوم"],
        correctAnswer: 1
    },

    {
        question: "ماذا يحدث عند حذف مجلد env بالكامل؟",
        options: ["تبقى البيئة تعمل","تتلف بايثون النظام","تُحذف البيئة بالكامل","يتم حذف جميع المشاريع"],
        correctAnswer: 2
    },

    {
        question: "الأمر pip uninstall يقوم بـ…",
        options: ["إزالة الحزمة من النظام فقط","إزالة الحزمة من البيئة المفعّلة","تعطيل البيئة","حذف بيئة كاملة",],
        correctAnswer: 1
    },
    
    {
        question: "العلامة التي تظهر عند تفعيل البيئة في الطرفية؟",
        options: ["اسم الحاسوب","اسم النظام","اسم البيئة بين أقواس","مسار المشروع",],
        correctAnswer: 2
    },

    {
        question: "فضل طريقة لنسخ بيئة افتراضية؟",
        options: ["نسخ مجلد env","استخدام requirements.txt","zip للمجلد وتشغيله","نسخ بايثون",],
        correctAnswer: 1
    },

    {
        question: "هل يمكن تشغيل بيئة افتراضية بدون تفعيل؟",
        options: ["نعم باستخدام المسار الكامل لبايثون داخلها","لا"],
        correctAnswer: 0
    },

    {
        question: "pipenv يقدّم ميزة…",
        options: ["إدارة الحزم والبيئات معًا","استضافة المواقع","تسريع بايثون","حذف الأنظمة",],
        correctAnswer: 0
    },

    {
        question: "ملف Pipfile يستخدم لـ…",
        options: ["تعريف قواعد الجدار الناري","تتبع الحزم وإعدادات البيئة","تعريف المتغيرات الأمنية","الاحتفاظ بالنسخ الاحتياطية",],
        correctAnswer: 1
    },

    {
        question: "أي من التالي يحدث خارج البيئة الافتراضية؟",
        options: ["تثبيت الحزم","تشغيل التطبيقات","استخدام pip الخاص بالنظام","تثبيت المتطلبات",],
        correctAnswer: 2
    },

    {
        question: "Conda تختلف عن venv بأنها…",
        options: ["تعمل للحزم فقط","تدير حزم ولغات عديدة","تعمل فقط على Windows","تتطلب إنترنت دائم",],
        correctAnswer: 1
    },

    {
        question: "ما الأمر لعرض البيئات في conda؟",
        options: ["conda list env","conda envs","conda info --envs","conda get",],
        correctAnswer: 2
    },

    {
        question: "مشكلة “Package version conflict” تظهر بسبب",
        options: ["ضعف الإنترنت","اختلاف إصدار الحزمة المطلوبة","بطء النظام","نقص الذاكرة",],
        correctAnswer: 1
    },

    {
        question: "Pyenv يُستخدم لـ…",
        options: ["إنشاء حاويات","إدارة إصدارات بايثون","تثبيت pip","تثبيت conda",],
        correctAnswer: 1
    },

    {
        question: "هل يمكن لبيئتين استخدام إصدارين مختلفين من الحزمة نفسها؟",
        options: ["نعم","لا"],
        correctAnswer: 0
    },

    {
        question: "عند استخدام VS Code، يتم تفعيل البيئة عبر",
        options: ["اختيار Interpreter الصحيح","إعادة تثبيت بايثون","حذف workspace","إنشاء مشروع جديد",],
        correctAnswer: 0
    },

    {
        question: "py -m pi يشير إلى…",
        options: ["pip النظام فقط","pip المرتبط بإصدار py المستخدم","pip داخل المتصفح","pip الظاهري فقط",],
        correctAnswer: 1
    },

    {
        question: "ملف pyproject.toml يستخدم في…",
        options: ["تعريف مشروع بايثون وبيئة البناء","تشغيل الخادم","تعديل النظام","تحديث kernel",],
        correctAnswer: 0
    },

    {
        question: " 40.Poetry هو",
        options: ["محرّر نصوص","نظام إدارة حزم وبيئات","قاعدة بيانات","مترجم لغات",],
        correctAnswer: 1
    },

    {
        question: "ما الأمر لحذف حزمة داخل بيئة؟",
        options: ["pip delete","pip uninstall","remove pip","pkg remove",],
        correctAnswer: 1
    },

    {
        question: "ما مخزن الحزم الخاص بـ pip؟",
        options: ["GitHub","PyPI","Docker Hub","Google Drive",],
        correctAnswer: 1
    },

    {
        question: "عند تشغيل python داخل بيئة افتراضية، فإنه يستخدم…",
        options: [" Python النظام دائمًا","Python المُثبت في البيئة","أحدث إصدار في الإنترنت","Python من السحابة",],
        correctAnswer: 1
    },

    {
        question: "أي من التالي يحدث عند تفعيل البيئة؟",
        options: ["تغيير متغير PATH مؤقتًا","حذف حزم النظام","إعادة تشغيل الجهاز","تنزيل بايثون جديد",],
        correctAnswer: 0
    },

    {
        question: "بيئة venv تعتمد على…",
        options: ["ملفات config.json"," مجلد Scripts أو ","ملف exe وحيد","ملف dll"],
        correctAnswer: 1
    },

    {
        question: "هل تؤثر الحزم داخل البيئة على مشاريع أخرى؟",
        options: ["نعم","لا"],
        correctAnswer: 1
    },

    {
        question: "ما الأمر لعرض تفاصيل حزمة معينة؟",
        options: ["pip info","pip show","pip details","pip inspect",],
        correctAnswer: 2
    },

    {
        question: "ما ميزة virtualenv على venv؟",
        options: ["أسرع دائمًا","يعمل على كل إصدارات بايثون","يحتوي أدوات إدارة إضافية","أكبر حجمًا",],
        correctAnswer: 2
    },

    {
        question: "استخدام البيئات الافتراضية يعتبر من",
        options: ["أفضل ممارسات تطوير البرمجيات","الأمور غير الضرورية","خطوات متقدمة للمحترفين فقط","بديلًا عن Git",],
        correctAnswer: 0,
        topic: "virtual-env",
        difficulty: 1
    },

    // ============================================================
    // 🔐 CYBERSECURITY QUESTIONS — أسئلة الأمن السيبراني
    // ============================================================

    {
        question: "🔐 [Cybersecurity] ما هو تعريف الأمن السيبراني؟ | What is Cybersecurity?",
        options: [
            "حماية الأنظمة والشبكات من الهجمات الرقمية | Protecting systems & networks from digital attacks",
            "برنامج لتسريع الإنترنت | A program to speed up the internet",
            "نوع من قواعد البيانات | A type of database",
            "جهاز لتوصيل الأجهزة | A device to connect hardware"
        ],
        correctAnswer: 0,
        topic: "cybersecurity",
        difficulty: 1
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ Phishing؟ | What is Phishing?",
        options: [
            "برنامج لضغط الملفات | A file compression tool",
            "هجوم احتيالي يهدف لسرقة بيانات المستخدم عبر رسائل مزيّفة | A fraudulent attack to steal user data via fake messages",
            "نوع من أنواع التشفير | A type of encryption",
            "جدار حماية للشبكة | A network firewall"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 1
    },

    {
        question: "🔐 [Cybersecurity] ماذا يعني اختصار VPN؟ | What does VPN stand for?",
        options: [
            "Virtual Private Network — شبكة خاصة افتراضية",
            "Verified Public Node — عقدة عامة موثقة",
            "Virtual Packet Network — شبكة حزم افتراضية",
            "Visual Protocol Node — بروتوكول مرئي"
        ],
        correctAnswer: 0,
        topic: "cybersecurity",
        difficulty: 1
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ Firewall؟ | What is a Firewall?",
        options: [
            "برنامج لتحرير الصور | Image editing software",
            "نظام يراقب ويتحكم في حركة الشبكة بناءً على قواعد أمنية | A system that monitors and controls network traffic based on security rules",
            "نوع من أنواع الفيروسات | A type of virus",
            "جهاز تخزين | A storage device"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 1
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ Malware؟ | What is Malware?",
        options: [
            "نظام تشغيل آمن | A secure operating system",
            "برنامج خبيث مصمم للإضرار بالأنظمة | Malicious software designed to harm systems",
            "نوع من بروتوكولات الشبكة | A type of network protocol",
            "أداة لإدارة قواعد البيانات | A database management tool"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 1
    },

    {
        question: "🔐 [Cybersecurity] ما الفرق بين HTTP و HTTPS؟ | Difference between HTTP and HTTPS?",
        options: [
            "لا يوجد فرق | No difference",
            "HTTPS أبطأ دائمًا | HTTPS is always slower",
            "HTTPS يستخدم التشفير لتأمين الاتصال | HTTPS uses encryption to secure the connection",
            "HTTP أكثر أمانًا | HTTP is more secure"
        ],
        correctAnswer: 2,
        topic: "cybersecurity",
        difficulty: 1
    },

    {
        question: "🔐 [Cybersecurity] ما هو هجوم الـ Ransomware؟ | What is a Ransomware Attack?",
        options: [
            "سرقة كلمات المرور فقط | Only stealing passwords",
            "برنامج يقوم بتشفير ملفاتك ويطلب فدية لاستعادتها | Software that encrypts your files and demands ransom to restore them",
            "هجوم على شبكات Wi-Fi | An attack on Wi-Fi networks",
            "فيروس يُبطئ الجهاز | A virus that slows down the device"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 2
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ Two-Factor Authentication (2FA)؟",
        options: [
            "تسجيل دخول بكلمة مرور فقط | Login with password only",
            "طبقة ثانية من التحقق تُضاف إلى كلمة المرور لزيادة الأمان | A second verification layer added to password for extra security",
            "نوع من أنواع التشفير | A type of encryption",
            "جهاز للتحقق البيومتري فقط | A biometric-only device"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 1
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ SQL Injection؟ | What is SQL Injection?",
        options: [
            "نوع من هجمات إدخال كود SQL خبيث في نماذج المواقع | Injecting malicious SQL code into website forms to attack the database",
            "طريقة لتحسين قواعد البيانات | A method to optimize databases",
            "نوع من أنواع التشفير | A type of encryption",
            "أداة لعمل نسخ احتياطي | A backup tool"
        ],
        correctAnswer: 0,
        topic: "cybersecurity",
        difficulty: 2
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ Man-in-the-Middle Attack (MITM)؟",
        options: [
            "هجوم يقوم فيه المهاجم بالتنصت والتدخل في الاتصال بين طرفين | An attack where the attacker intercepts communication between two parties",
            "هجوم على خوادم DNS | An attack on DNS servers",
            "فيروس يصيب الذاكرة العشوائية | A virus infecting RAM",
            "هجوم على كاميرات المراقبة | An attack on surveillance cameras"
        ],
        correctAnswer: 0,
        topic: "cybersecurity",
        difficulty: 2
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ DDoS Attack؟ | What is a DDoS Attack?",
        options: [
            "هجوم يستهدف كلمات المرور | An attack targeting passwords",
            "إغراق الخادم بطلبات وهمية لإيقافه عن العمل | Flooding a server with fake requests to make it crash",
            "نوع من الفيروسات على الأجهزة | A type of virus on devices",
            "اختراق نظام التشغيل مباشرة | Directly hacking the OS"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 2
    },

    {
        question: "🔐 [Cybersecurity] ما هو هجوم الـ Brute Force؟ | What is a Brute Force Attack?",
        options: [
            "هجوم يستخدم الهندسة الاجتماعية | An attack using social engineering",
            "تجربة جميع كلمات المرور الممكنة حتى الوصول للصحيحة | Trying all possible passwords until finding the correct one",
            "استغلال ثغرة في قاعدة البيانات | Exploiting a database vulnerability",
            "هجوم عبر البريد الإلكتروني | An email-based attack"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 2
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ Zero-Day Vulnerability؟",
        options: [
            "ثغرة أمنية معروفة ومُصلّحة | A known and patched security vulnerability",
            "ثغرة أمنية غير معروفة للمطوّر بعد، ولم يتوفر لها تصحيح | An unknown vulnerability not yet patched by the developer",
            "اختراق يحدث في منتصف الليل | A hack that happens at midnight",
            "هجوم يستغرق صفر ثانية | An attack that takes zero seconds"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 3
    },

    {
        question: "🔐 [Cybersecurity] ما هو مبدأ Least Privilege؟ | What is the Least Privilege Principle?",
        options: [
            "منح المستخدم أعلى صلاحية ممكنة | Giving users the highest possible permission",
            "منح المستخدمين أدنى الصلاحيات الضرورية لأداء عملهم | Giving users only the minimum permissions needed to do their job",
            "إزالة كل الصلاحيات من المستخدمين | Removing all permissions from users",
            "مزامنة الصلاحيات تلقائيًا | Automatically syncing permissions"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 2
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ Encryption؟ | What is Encryption?",
        options: [
            "ضغط الملفات لتوفير المساحة | Compressing files to save space",
            "تحويل البيانات إلى صيغة غير مقروءة لحمايتها | Converting data into an unreadable format to protect it",
            "نسخ البيانات احتياطيًا | Backing up data",
            "مسح البيانات نهائيًا | Permanently deleting data"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 1
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ Social Engineering؟ | What is Social Engineering?",
        options: [
            "هجوم تقني على الخوادم | A technical attack on servers",
            "التلاعب النفسي بالأشخاص لإجبارهم على الكشف عن معلومات سرية | Psychologically manipulating people to reveal confidential information",
            "برنامج يختبر الشبكات | A program that tests networks",
            "نوع من بروتوكولات الإنترنت | A type of internet protocol"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 2
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ Penetration Testing؟ | What is Pen Testing?",
        options: [
            "اختبار سرعة الإنترنت فقط | Only testing internet speed",
            "محاولة اختراق النظام بشكل مشروع لاكتشاف الثغرات قبل المهاجمين | Legitimately attempting to hack a system to find vulnerabilities before attackers do",
            "نوع من أنواع المضادات الفيروسية | A type of antivirus",
            "برنامج لضغط البيانات | A data compression program"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 3
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ Trojan Horse في أمن المعلومات؟",
        options: [
            "سلاح قديم | An ancient weapon",
            "برنامج يبدو شرعيًا لكنه يُخفي كودًا خبيثًا | A seemingly legitimate program hiding malicious code",
            "نوع من جدران الحماية | A type of firewall",
            "بروتوكول تشفير للشبكة | A network encryption protocol"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 2
    },

    {
        question: "🔐 [Cybersecurity] ما أهمية تحديث البرامج بانتظام؟ | Why is regular software updating important?",
        options: [
            "لإضافة ميزات تجميلية فقط | Only to add cosmetic features",
            "لسد الثغرات الأمنية التي يكتشفها المطوّرون | To patch security vulnerabilities discovered by developers",
            "لزيادة حجم التطبيق | To increase application size",
            "لتغيير واجهة المستخدم | To change the user interface"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 1
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ Keylogger؟ | What is a Keylogger?",
        options: [
            "أداة لتحسين الأداء | A performance optimization tool",
            "برنامج خبيث يسجل كل ما تكتبه على لوحة المفاتيح لسرقة بياناتك | Malicious software that records every keystroke to steal your data",
            "نوع من أدوات البرمجة | A type of programming tool",
            "برنامج لتسجيل الصوت | A sound recording program"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 2
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ CIA Triad في الأمن السيبراني؟",
        options: [
            "ثلاثة بروتوكولات شبكة | Three network protocols",
            "Confidentiality (السرية), Integrity (النزاهة), Availability (التوافر) — الأعمدة الأساسية للأمن السيبراني",
            "ثلاثة أنواع من الفيروسات | Three types of viruses",
            "ثلاثة أجهزة للشبكة | Three network devices"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 3
    },

    {
        question: "🔐 [Cybersecurity] ما هو الـ Botnet؟ | What is a Botnet?",
        options: [
            "شبكة اجتماعية آمنة | A secure social network",
            "شبكة من الأجهزة المخترقة يتحكم فيها المهاجم عن بُعد لشنّ هجمات | A network of compromised devices controlled remotely by an attacker to launch attacks",
            "نوع من أدوات مراقبة الشبكة | A type of network monitoring tool",
            "بروتوكول لمشاركة الملفات | A file sharing protocol"
        ],
        correctAnswer: 1,
        topic: "cybersecurity",
        difficulty: 3
    },

    // ============================================================
    // 💡 NEW QUESTION TYPES DEMO (Fill in the Blank, Coding, Essay, etc.)
    // ============================================================

    {
        type: "fill-blank",
        question: "💡 [Fill Blank] اكتب الأمر المناسب لتفعيل البيئة الافتراضية في ويندوز؟ | Type the command to activate virtual environment in Windows:",
        correctAnswer: "Scripts\\\\activate",
        topic: "virtual-env",
        difficulty: 2
    },
    {
        type: "coding",
        question: "🖥️ [Coding] اكتب كود بايثون بسيط لإنشاء قائمة وطباعة العنصر الأول. | Write a simple Python code to create a list and print the first element.",
        correctAnswer: "list = [1, 2, 3]\\nprint(list[0])",
        topic: "virtual-env",
        difficulty: 3
    },
    {
        type: "essay",
        question: "📝 [Essay] اشرح بالتفصيل أهمية استخدام البيئات الافتراضية في تطوير بايثون؟ | Explain in detail the importance of using virtual environments in Python development.",
        correctAnswer: "تساعد البيئات الافتراضية على عزل حزم ومكاتب كل مشروع، مما يمنع تعارض الإصدارات بين المشاريع المختلفة. | Virtual environments isolate project dependencies, preventing version conflicts.",
        topic: "virtual-env",
        difficulty: 3
    },
    {
        type: "drag-drop",
        question: "🖱️ [Drag & Drop] رتب خطوات استجابة الحوادث الأمنية بالترتيب الصحيح. | Drag and drop the incident response steps in the correct order.",
        options: ["التحضير (Preparation)", "التعرف (Identification)", "الاحتواء (Containment)", "الاستئصال (Eradication)", "الاسترداد (Recovery)", "الدروس المستفادة (Lessons Learned)"],
        correctAnswer: [0, 1, 2, 3, 4, 5],
        topic: "cybersecurity",
        difficulty: 2
    },
    {
        type: "matching",
        question: "🔗 [Matching] طابق كل مصطلح بمعناه الصحيح. | Match each term with its correct definition.",
        pairs: [
            { left: "Phishing", right: "التصيد الاحتيالي لسرقة البيانات" },
            { left: "Ransomware", right: "برمجيات الفدية الخبيثة" },
            { left: "Firewall", right: "جدار حماية الشبكة" },
            { left: "VPN", right: "شبكة خاصة افتراضية" }
        ],
        // The correct Answers mapping
        correctAnswer: ["التصيد الاحتيالي لسرقة البيانات", "برمجيات الفدية الخبيثة", "جدار حماية الشبكة", "شبكة خاصة افتراضية"],
        topic: "cybersecurity",
        difficulty: 2
    },
    {
        type: "case-study",
        question: "🕵️‍♂️ [Case Study] حالة دراسية: اختراق شبكة الشركة.",
        context: "لاحظت شركة 'ألفا' بطئاً غير عادي في الخوادم وتوقف بعض الخدمات. بعد الفحص تبين أن هناك طلبات بمئات الآلاف تأتي من أجهزة مختلفة حول العالم إلى خادم الويب الأساسي في نفس الوقت.",
        subQuestions: [
            "ما نوع هذا الهجوم؟ | What type of attack is this?",
            "كيف يمكن التخفيف منه؟ | How can it be mitigated?"
        ],
        correctAnswer: "هذا هجوم DDoS. يمكن التخفيف منه باستخدام جدار حماية قوي، وخدمات مثل Cloudflare لفلترة الزيارات الزائفة. | This is a DDoS attack. Mitigate using Firewalls and services like Cloudflare.",
        topic: "cybersecurity",
        difficulty: 4
    },
    {
        type: "simulation",
        question: "🎮 [Simulation] محاكاة: اكتشاف البريد الإلكتروني الاحتيالي.",
        context: "لديك رسالة بريد إلكتروني من 'دعم البنك' تطلب منك الضغط على رابط لتحديث بياناتك بشكل عاجل. الرابط هو: http://bank-update-security.com.",
        actionBtnText: "تشغيل أداة تحليل الروابط | Run Link Analysis Tool",
        correctAnswer: "الرابط مزيف ولا يعود للنطاق الرسمي للبنك. عدم وجود HTTPS يثير الشك. يجب حذف الرسالة. | The link is fake and lacks HTTPS. Delete the email.",
        topic: "cybersecurity",
        difficulty: 3
    }

];

