import {ILang} from 'assets/lang/lang';

// Privacy policy text. Every statement here describes what the code actually does — when the code changes
// (new storage, analytics, AI, payments, accounts, notifications), this text must change before release.
// Placeholders: {controller} {email} {hosting} {site} {source} — filled from environment.privacy / app config.

export const PRIVACY_UPDATED = '2026-11-13';

export interface IPrivacySection {
    title: string;
    paragraphs?: string[];
    items?: string[];
    after?: string[];
}

export const PRIVACY_POLICY: Record<ILang, IPrivacySection[]> = {
    az: [
        {
            title: 'Biz kimik',
            paragraphs: [
                'Bu siyasət Astra veb saytına ({site}) və Astra mobil tətbiqinə aiddir.',
                'Şəxsi məlumatlarınızın emalına məsul şəxs: {controller}. Əlaqə: {email}.',
                'Astra açıq mənbəli layihədir. Serverdə işləyən kodun tam mətni {source} ünvanında hər kəs üçün açıqdır, ona görə burada yazılanları özünüz də yoxlaya bilərsiniz.',
            ],
        },
        {
            title: 'Hansı məlumatları emal edirik',
            items: [
                'Doğum məlumatları: ad (istəyə görə), doğum tarixi, doğum saatı (istəyə görə), doğum yeri (şəhər adı, koordinatlar və saat qurşağı) və seçdiyiniz ev sistemi.',
                'Uyğunluq hesablaması üçün ikinci şəxsin eyni məlumatları. Başqa birinin məlumatlarını daxil edirsinizsə, onun razılığını almaq sizin məsuliyyətinizdir.',
                'Numerologiya üçün tam ad (istəyə görə) və doğum tarixi. Çin astrologiyası (BaZi) üçün cins.',
                'Şəhər axtarışına yazdığınız mətn.',
                'Texniki məlumat: hər internet sorğusunda olduğu kimi, IP ünvanınız və sorğunun vaxtı serverə çatır.',
            ],
            after: ['Hesab, email, telefon nömrəsi və ödəniş məlumatı toplamırıq: hazırda Astra-da qeydiyyat və ödəniş yoxdur.'],
        },
        {
            title: 'Məqsəd və hüquqi əsas',
            paragraphs: [
                'Məlumatlarınızı yalnız sizin istəyinizlə xəritəni hesablamaq və nəticəni sizə göstərmək üçün emal edirik. Hüquqi əsas istədiyiniz xidmətin göstərilməsidir.',
                'Cihazınızda saxlama yalnız sizin açıq hərəkətinizlə (“Bu cihazda yadda saxla” düyməsi) baş verir.',
                'Məlumatlarınızı reklam, profil qurma, satış və ya süni intellekt modellərinin öyrədilməsi üçün istifadə etmirik.',
            ],
        },
        {
            title: 'Serverdə necə emal olunur',
            items: [
                'Məlumatlar şifrələnmiş bağlantı (HTTPS) ilə göndərilir.',
                'Server hesablamanı yaddaşda aparır, nəticəni qaytarır və məlumatı saxlamır: verilənlər bazası yoxdur, doğum məlumatları diskə yazılmır.',
                'Serverimiz sorğu jurnalı (access log) aparmır.',
                'Hosting provayderi ({hosting}) şəbəkə səviyyəsində texniki məlumatları (məsələn, IP ünvanını) öz təhlükəsizlik məqsədləri üçün qısa müddətə emal edə bilər.',
                'Zi Wei Dou Shu xəritəsi tamamilə cihazınızda hesablanır. Bunun üçün heç bir məlumat göndərilmir.',
            ],
        },
        {
            title: 'Cihazınızda saxlananlar',
            items: [
                'Dil seçiminiz.',
                'Yalnız “Bu cihazda yadda saxla” düyməsini basdığınız xəritələr. Onlar yalnız bu brauzerdə və ya tətbiqdə qalır, serverə göndərilmir.',
                'Hesablanmış nəticələr səhifə açıq olduğu müddətdə yaddaşda saxlanılır və səhifə bağlananda silinir.',
            ],
            after: ['Saxlanmış xəritəni siyahıdakı “Sil” düyməsi ilə və ya brauzerin sayt məlumatlarını təmizləməklə silə bilərsiniz.'],
        },
        {
            title: 'Cookie, analitika və kənar xidmətlər',
            paragraphs: [
                'Cookie, analitika, reklam və ya izləmə alətlərindən istifadə etmirik.',
                'Şriftlər və digər fayllar öz serverimizdən yüklənir, səhifə üçüncü tərəf serverlərinə sorğu göndərmir. Saytın aşağısındakı keçidlər (GitHub, GeoNames) yalnız onlara klikləyəndə açılır.',
            ],
        },
        {
            title: 'Məlumatların ötürülməsi',
            paragraphs: [
                'Məlumatlarınızı satmırıq və heç kimə ötürmürük. Yeganə istisna serverin yerləşdiyi hosting provayderidir ({hosting}). O, məlumatı yalnız texniki olaraq, bizim adımıza ötürür.',
                'Server sizin ölkənizdən kənarda yerləşə bilər.',
                'Qanunla tələb olunarsa, səlahiyyətli orqanlara cavab verə bilərik. Lakin serverdə doğum məlumatları saxlanmadığı üçün belə məlumat təqdim edə bilmərik.',
            ],
        },
        {
            title: 'Saxlama müddəti',
            items: [
                'Serverdə: saxlanmır, yalnız hesablama anında emal olunur.',
                'Cihazınızda: siz silənə qədər.',
            ],
        },
        {
            title: 'Uşaqlar',
            paragraphs: ['Astra 16 yaşdan kiçik uşaqlar üçün nəzərdə tutulmayıb. 16 yaşdan kiçiksinizsə, xidmətdən valideyninizin və ya qəyyumunuzun icazəsi ilə istifadə edin.'],
        },
        {
            title: 'Hüquqlarınız',
            paragraphs: [
                'Məlumatlarınıza giriş, onları düzəltmək, silmək və emalına etiraz etmək hüququnuz var. Serverdə məlumat saxlamadığımız üçün sizə aid saxlanmış məlumat yoxdur. Cihazınızdakı məlumatlar isə tam sizin nəzarətinizdədir.',
                'Sualınız və ya şikayətiniz varsa, {email} ünvanına yazın. Yaşadığınız ölkənin məlumatların qorunması üzrə səlahiyyətli orqanına şikayət etmək hüququnuz da var.',
            ],
        },
        {
            title: 'Dəyişikliklər',
            paragraphs: ['Gələcəkdə süni intellekt əsaslı hesabatlar, ödənişlər, hesablar və ya bildirişlər əlavə edilərsə, bu siyasət onlar istifadəyə verilməzdən əvvəl yenilənəcək və lazım olduqda razılığınız alınacaq. Hər dəyişiklikdə yuxarıdakı “Son yenilənmə” tarixi dəyişir.'],
        },
        {
            title: 'Əlaqə',
            paragraphs: ['{controller} · {email}'],
        },
    ],
    en: [
        {
            title: 'Who we are',
            paragraphs: [
                'This policy covers the Astra website ({site}) and the Astra mobile app.',
                'The person responsible for processing your personal data (controller): {controller}. Contact: {email}.',
                'Astra is open source. The complete source code running on the server is public at {source}, so you can check what is written here yourself.',
            ],
        },
        {
            title: 'What data we process',
            items: [
                'Birth data: name (optional), birth date, birth time (optional), birth place (city name, coordinates and time zone) and your chosen house system.',
                'For compatibility: the same data of a second person. If you enter someone else’s data, you are responsible for having their consent.',
                'For numerology: full name (optional) and birth date. For Chinese astrology (BaZi): gender.',
                'The text you type into the city search.',
                'Technical data: as with any internet request, your IP address and the time of the request reach the server.',
            ],
            after: ['We do not collect accounts, email addresses, phone numbers or payment details: Astra currently has no registration and no payments.'],
        },
        {
            title: 'Purpose and legal basis',
            paragraphs: [
                'We process your data only at your request, to calculate the chart and show you the result. The legal basis is providing the service you asked for.',
                'Storage on your device happens only through your explicit action (the “Save on this device” button).',
                'We do not use your data for advertising, profiling, sale or training AI models.',
            ],
        },
        {
            title: 'How the server processes it',
            items: [
                'Data is sent over an encrypted connection (HTTPS).',
                'The server calculates in memory, returns the result and does not keep the data: there is no database, and birth data is never written to disk.',
                'Our server keeps no request (access) logs.',
                'The hosting provider ({hosting}) may briefly process technical data at the network level (such as IP addresses) for its own security purposes.',
                'The Zi Wei Dou Shu chart is calculated entirely on your device. No data is sent for it.',
            ],
        },
        {
            title: 'What is stored on your device',
            items: [
                'Your language choice.',
                'Only the charts you save with “Save on this device”. They stay in this browser or app only and are never sent to the server.',
                'Calculated results are kept in memory while the page is open and are discarded when it is closed.',
            ],
            after: ['You can delete a saved chart with the “Delete” button in the list, or by clearing the site data in your browser.'],
        },
        {
            title: 'Cookies, analytics and third parties',
            paragraphs: [
                'We use no cookies, analytics, advertising or tracking tools.',
                'Fonts and other files are loaded from our own server; the page makes no requests to third-party servers. The links in the footer (GitHub, GeoNames) open only when you click them.',
            ],
        },
        {
            title: 'Sharing',
            paragraphs: [
                'We do not sell or share your data. The only exception is the hosting provider that runs the server ({hosting}), which transmits data only technically and on our behalf.',
                'The server may be located outside your country.',
                'If required by law, we may respond to competent authorities. Because no birth data is stored on the server, we would have no such data to provide.',
            ],
        },
        {
            title: 'Retention',
            items: [
                'On the server: none. Data is processed only while the calculation runs.',
                'On your device: until you delete it.',
            ],
        },
        {
            title: 'Children',
            paragraphs: ['Astra is not intended for children under 16. If you are under 16, use the service only with the permission of a parent or guardian.'],
        },
        {
            title: 'Your rights',
            paragraphs: [
                'You have the right to access, correct and delete your data and to object to its processing. Because we store nothing on the server, there is no stored data about you. The data on your device is fully under your control.',
                'For questions or complaints, write to {email}. You also have the right to complain to the data protection authority in your country.',
            ],
        },
        {
            title: 'Changes',
            paragraphs: ['If AI-based reports, payments, accounts or notifications are added in the future, this policy will be updated before they go live, and your consent will be asked where required. The “Last updated” date above changes with every revision.'],
        },
        {
            title: 'Contact',
            paragraphs: ['{controller} · {email}'],
        },
    ],
};
