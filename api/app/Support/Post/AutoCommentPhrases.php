<?php

namespace App\Support\Post;

/**
 * Combinatorial generic comment bodies (no @mentions, no clip-specific cricket terms).
 *
 * Mixes short blessing/praise/origin lines with longer natural chat and an
 * opener+middle+closer composer so repeats stay rare.
 * Optionally weaves the post creator's first name (e.g. "Bohat khoob Ali").
 */
class AutoCommentPhrases
{
    /** @var list<string> */
    private const BLESSINGS = [
        'MashAllah',
        'Ma sha Allah',
        'Masha Allah',
        'Allah bless you',
        'Allah khush rakhe',
        'Rab barkat de',
        'Boht khoob',
        'Bohat khoob',
        'Kya baat hai',
        'Zabardast',
        'Shabash',
        'Wah wah',
        'Kamal hai',
        'Lajawab',
        'Fadu',
        'Mashallah jee',
    ];

    /** @var list<string> */
    private const PRAISE = [
        'Keep it up',
        'Keep going',
        'Hero',
        'Too good',
        'Nice one',
        'Good one',
        'Well done',
        'Respect',
        'Love this',
        'Bohat acha',
        'Bohat umda',
        'Bohat awla',
        'Mast hai',
        'Sahi hai',
        'Acha laga',
        'Mazaa agaya',
        'Jeetay raho',
        'Full support',
        'Always support',
        'Proud of you',
        'Super',
        'Very nice',
        'Top class',
        'Dil se',
    ];

    /** @var list<string> */
    private const ADDRESS = [
        'bro',
        'bhai',
        'bhai jan',
        'yaar',
        'janab',
        'jee',
    ];

    /** Complete where-from lines — used as a whole comment. */
    /** @var list<string> */
    private const ORIGIN = [
        'bhai where are you from?',
        'bro where are you from?',
        'where are you from bhai?',
        'where are you from bro?',
        'where you from?',
        'where you from bro?',
        'bhai ap kahan sy hain?',
        'bhai kahan sy hain ap?',
        'kahan sy hain ap bro?',
        'kahan sy hain ap bhai?',
        'ap kahan sy hain?',
        'ap kahan se ho?',
        'ap kahan se hain?',
        'ap kahan k ho?',
        'kis city se ho?',
        'ap ka city konsa hai?',
        'kis shehar se ho?',
        'ap kis ilaqe se ho?',
        'bhai kahan ke?',
        'kahan se ho yaar?',
        'bhai kidhar se?',
        'bhai ap kidhar se ho?',
        'ap kahan rehte ho?',
        'kidhar ke ho janab?',
        'from which city?',
        'which city bhai?',
        'city batao?',
        'ilaqa batao bhai?',
        'bhai city konsi hai?',
    ];

    /** Short support lines — not follow-bait. */
    /** @var list<string> */
    private const CHAT = [
        'stay blessed',
        'take care',
        'always with you',
        'keep it coming',
        'waiting for more',
        'keep posting',
        'carry on',
        'big fan',
        'true support',
        'Allah aap ko salamat rakhe',
    ];

    /** Ready-typed comments people actually leave. */
    /** @var list<string> */
    private const READY = [
        'MashAllah keep it up',
        'Ma sha Allah bhai',
        'Mashallah ❤️',
        'Zabardast yaar',
        'Kya baat hai bhai',
        'Keep it up bro',
        'Keep it up bhai',
        'Bohat khoob 🔥',
        'Love this ❤️',
        'Sahi hai bhai',
        'Acha laga',
        'MashAllah jee 👏',
        'Full support bhai',
        'Jeetay raho',
        'bhai ap kahan sy hain?',
        'bhai where are you from?',
        'kahan sy hain ap bro?',
        'ap kahan se ho?',
        'kis city se ho bhai?',
        'where are you from bro?',
        'Too good bro',
        'Nice one yaar',
        'Wah bhai wah',
        'Kamal hai 🔥',
        'stay blessed bro',
        'always support ❤️',
        'Ma sha Allah keep going',
        'bhai mashallah',
        'hero 🔥',
    ];

    /** Longer complete comments — generic so they fit any post. */
    /** @var list<string> */
    private const LONG = [
        'MashAllah bohat acha laga, keep it up bhai',
        'Bhai ye to kamal ho gaya, bohat umda',
        'Ma sha Allah, Allah aap ko kamyabi de',
        'Yaara dil khush ho gaya, zabardast',
        'Sach me bohat zabardast, keep going',
        'Allah aap ko hamesha khush rakhe bhai',
        'Bhai ap ki mehnat nazar aa rahi hai, bohat umda',
        'Kya baat hai yaar, ye to next level hai',
        'Bohat khoob bhai, full support',
        'Respect bro, bohat acha kiya hai',
        'Mashallah bohat acha, jeetay raho',
        'Full support hai bhai ap k ley',
        'Mujhe to bohat pasand aya, sahi hai',
        'Mashallah bohat sohna, Allah nazar e bad se bachaye',
        'Bhai mazaa agaya, keep it up',
        'Yaar kamal kar diya, proud of you',
        'Proud of you bhai, Allah aap ko izzat de',
        'Bohat acha hai ye, keep it up',
        'Wah bhai wah, kya andaaz hai',
        'Mashallah bhai, top class',
    ];

    /** Pieces for composed long comments: opener + middle + closer. */
    /** @var list<string> */
    private const OPENERS = [
        'MashAllah',
        'Bhai sach me',
        'Yaar',
        'Wah',
        'Ma sha Allah',
        'Honestly',
        'Bohat khoob',
        'Kya baat hai',
        'Dil se bolun to',
        'Bro',
    ];

    /** @var list<string> */
    private const MIDDLES = [
        'bohat acha laga',
        'ap ki mehnat nazar aa rahi hai',
        'ye to next level hai',
        'maza agaya',
        'bohat zabardast kaam hai',
        'ap ne dil jeet liya',
        'har dafa kuch naya milta hai',
        'bohat din baad kuch itna acha mila',
        'ap ka andaaz sab se alag hai',
        'ye bohat special hai',
    ];

    /** @var list<string> */
    private const CLOSERS = [
        'keep it up',
        'Allah aap ko kamyab kare',
        'aise hi karte raho',
        'full support hai',
        'jeetay raho',
        'stay blessed',
        'Allah barkat de',
        'bas aage barhte raho',
        'proud of you',
        'sahi ja rahe ho',
    ];

    /** @var list<string> */
    private const EMOJI = [
        '❤️',
        '✌️',
        '🔥',
        '👏',
        '💪',
        '🙌',
        '💯',
        '✨',
        '😍',
        '🤍',
        '😊',
        '🙏',
    ];

    public static function random(?string $creatorFirstName = null): string
    {
        $name = self::firstNameFrom($creatorFirstName);
        $roll = random_int(1, 100);

        $body = match (true) {
            $name !== null && $roll <= 20 => self::namedLine($name),
            $roll <= 30 => self::withOptionalCreatorName(self::pick(self::READY), $name),
            $roll <= 38 => self::withOptionalCreatorName(self::originLine(), $name),
            $roll <= 48 => self::withOptionalEmoji(self::withOptionalCreatorName(
                self::withOptionalAddress(self::pick(self::BLESSINGS)),
                $name,
            )),
            $roll <= 56 => self::withOptionalEmoji(self::withOptionalCreatorName(
                self::withOptionalAddress(self::pick(self::PRAISE)),
                $name,
            )),
            $roll <= 62 => self::withOptionalEmoji(self::withOptionalCreatorName(self::join(
                self::pick(self::BLESSINGS),
                self::pick(self::PRAISE),
                self::maybeAddress(),
            ), $name)),
            $roll <= 66 => self::withOptionalEmoji(self::withOptionalCreatorName(self::pick(self::CHAT), $name)),
            $roll <= 82 => self::withOptionalCreatorName(self::longLine(), $name),
            $roll <= 96 => self::withOptionalCreatorName(self::composedLine(), $name),
            $roll <= 98 => self::pick(self::EMOJI),
            default => self::withOptionalEmoji(self::withOptionalCreatorName(self::pick(self::BLESSINGS), $name)),
        };

        return mb_substr(self::vary($body), 0, 500);
    }

    /**
     * Pick a body that is not already used on this post (case, spacing, trailing punctuation ignored).
     *
     * @param  list<string>|iterable<int, string>  $existingBodies
     */
    public static function randomUnused(iterable $existingBodies, ?string $creatorFirstName = null): ?string
    {
        $used = [];
        foreach ($existingBodies as $body) {
            $key = self::normalize((string) $body);
            if ($key !== '') {
                $used[$key] = true;
            }
        }

        for ($i = 0; $i < 40; $i++) {
            $candidate = self::random($creatorFirstName);
            $key = self::normalize($candidate);
            if ($key !== '' && ! isset($used[$key])) {
                return $candidate;
            }
        }

        return null;
    }

    /** First word of display name, letters only (e.g. "Ali Muraad" → "Ali"). */
    public static function firstNameFrom(?string $fullName): ?string
    {
        if ($fullName === null) {
            return null;
        }

        $fullName = trim(preg_replace('/\s+/u', ' ', $fullName) ?? $fullName);
        if ($fullName === '') {
            return null;
        }

        $parts = preg_split('/\s+/u', $fullName) ?: [];
        $first = $parts[0] ?? '';

        return self::sanitizeFirstName($first);
    }

    public static function normalize(string $body): string
    {
        $body = mb_strtolower(trim(preg_replace('/\s+/u', ' ', $body) ?? $body));

        return rtrim($body, " \t.!?");
    }

    private static function sanitizeFirstName(?string $name): ?string
    {
        if ($name === null) {
            return null;
        }

        $name = trim($name);
        $name = preg_replace('/[^\p{L}\p{M}\'-]/u', '', $name) ?? '';
        $name = trim($name, " \t'-");

        if ($name === '' || mb_strlen($name) < 2 || mb_strlen($name) > 20) {
            return null;
        }

        if (preg_match('/^(user|admin|test|null|undefined|player|guest)$/iu', $name) === 1) {
            return null;
        }

        return mb_convert_case($name, MB_CASE_TITLE, 'UTF-8');
    }

    private static function namedLine(string $name): string
    {
        $line = match (random_int(0, 7)) {
            0 => self::join(self::pick(self::BLESSINGS), $name),
            1 => self::join($name, self::pick(self::BLESSINGS)),
            2 => self::join(self::pick(self::PRAISE), $name),
            3 => self::join($name, self::pick(self::PRAISE)),
            4 => self::join('Bohat khoob', $name),
            5 => self::join($name, 'bohat awla'),
            6 => self::join($name, 'bhai', self::pick(self::BLESSINGS)),
            default => self::join(self::pick(self::BLESSINGS), $name, 'bhai'),
        };

        return self::withOptionalEmoji($line);
    }

    private static function longLine(): string
    {
        return self::withOptionalEmoji(self::pick(self::LONG));
    }

    private static function composedLine(): string
    {
        $parts = [self::pick(self::OPENERS), self::pick(self::MIDDLES)];

        if (random_int(1, 100) <= 75) {
            $parts[] = self::pick(self::CLOSERS);
        }

        $line = self::join(...$parts);
        if (count($parts) === 3 && random_int(1, 2) === 1) {
            $line = self::join($parts[0], $parts[1]).', '.$parts[2];
        }

        return self::withOptionalEmoji(self::withOptionalAddress($line));
    }

    private static function withOptionalCreatorName(string $line, ?string $name): string
    {
        if ($name === null || $name === '') {
            return $line;
        }

        if (preg_match('/\p{L}/u', $line) !== 1) {
            return $line;
        }

        if (self::lineHasName($line, $name) || random_int(1, 100) > 40) {
            return $line;
        }

        return random_int(0, 1) === 1
            ? self::join($line, $name)
            : self::join($name, $line);
    }

    private static function lineHasName(string $line, string $name): bool
    {
        return (bool) preg_match('/\b'.preg_quote($name, '/').'\b/iu', $line);
    }

    private static function originLine(): string
    {
        return self::withOptionalEmoji(self::pick(self::ORIGIN));
    }

    private static function withOptionalAddress(string $line): string
    {
        if (self::alreadyAddresses($line) || random_int(1, 3) === 1) {
            return $line;
        }

        return random_int(0, 1) === 1
            ? self::join(self::pick(self::ADDRESS), $line)
            : self::join($line, self::pick(self::ADDRESS));
    }

    private static function withOptionalEmoji(string $line): string
    {
        if (random_int(1, 5) !== 1) {
            return $line;
        }

        return self::join($line, self::pick(self::EMOJI));
    }

    private static function maybeAddress(): string
    {
        return random_int(1, 2) === 1 ? '' : self::pick(self::ADDRESS);
    }

    private static function alreadyAddresses(string $line): bool
    {
        return (bool) preg_match('/\b(bro+|bhai|yaar|janab|jee|ap)\b/iu', $line);
    }

    /**
     * @param  list<string>  $pool
     */
    private static function pick(array $pool): string
    {
        return $pool[array_rand($pool)];
    }

    private static function join(string ...$parts): string
    {
        $tokens = [];
        foreach ($parts as $part) {
            $part = trim($part);
            if ($part === '') {
                continue;
            }
            foreach (preg_split('/\s+/u', $part) ?: [] as $token) {
                $prev = $tokens[array_key_last($tokens)] ?? null;
                if ($prev !== null && mb_strtolower($prev) === mb_strtolower($token)) {
                    continue;
                }
                $tokens[] = $token;
            }
        }

        return implode(' ', $tokens);
    }

    private static function vary(string $body): string
    {
        $body = trim(preg_replace('/\s+/u', ' ', $body) ?? $body);

        if (preg_match('/\p{L}/u', $body) !== 1) {
            if (random_int(0, 2) === 1) {
                $body = self::join($body, self::pick(self::EMOJI));
            }

            return $body;
        }

        if (random_int(1, 12) === 1 && preg_match('/\bbro$/i', $body) === 1) {
            $body .= 'o';
        }

        if (random_int(1, 12) === 1) {
            $body = mb_strtolower($body);
        }

        if (str_contains($body, '?')) {
            return $body;
        }

        if (random_int(1, 8) !== 1) {
            return $body;
        }

        return $body.(random_int(0, 3) === 0 ? '!!' : '!');
    }
}
