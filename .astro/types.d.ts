declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>,
				import('astro/zod').ZodLiteral<'avif'>,
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"atoi/page.mdx": {
	id: "atoi/page.mdx";
  slug: "atoi/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"cracking-the-code-interview/1-1-is-unique/page.mdx": {
	id: "cracking-the-code-interview/1-1-is-unique/page.mdx";
  slug: "cracking-the-code-interview/1-1-is-unique/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"cracking-the-code-interview/1-2-check-permutations/page.mdx": {
	id: "cracking-the-code-interview/1-2-check-permutations/page.mdx";
  slug: "cracking-the-code-interview/1-2-check-permutations/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"cracking-the-code-interview/1-3-urlify/page.mdx": {
	id: "cracking-the-code-interview/1-3-urlify/page.mdx";
  slug: "cracking-the-code-interview/1-3-urlify/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"cracking-the-code-interview/1-8-zero-matrix/page.mdx": {
	id: "cracking-the-code-interview/1-8-zero-matrix/page.mdx";
  slug: "cracking-the-code-interview/1-8-zero-matrix/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"cracking-the-code-interview/1-9-string-rotation/page.mdx": {
	id: "cracking-the-code-interview/1-9-string-rotation/page.mdx";
  slug: "cracking-the-code-interview/1-9-string-rotation/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"first-post.mdx": {
	id: "first-post.mdx";
  slug: "first-post";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"free-code-camp/no-repeats-please/page.mdx": {
	id: "free-code-camp/no-repeats-please/page.mdx";
  slug: "free-code-camp/no-repeats-please/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"free-code-camp/pairwise/page.mdx": {
	id: "free-code-camp/pairwise/page.mdx";
  slug: "free-code-camp/pairwise/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"free-code-camp/symmetric-difference/page.mdx": {
	id: "free-code-camp/symmetric-difference/page.mdx";
  slug: "free-code-camp/symmetric-difference/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"hello-world/page.mdx": {
	id: "hello-world/page.mdx";
  slug: "hello-world/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"jest/tohavebeencalledwith-partial-expect-anything/page.mdx": {
	id: "jest/tohavebeencalledwith-partial-expect-anything/page.mdx";
  slug: "jest/tohavebeencalledwith-partial-expect-anything/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/1-two-sum/page.mdx": {
	id: "leetcode/1-two-sum/page.mdx";
  slug: "leetcode/1-two-sum/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/1004-max-consecutive-ones-iii/page.mdx": {
	id: "leetcode/1004-max-consecutive-ones-iii/page.mdx";
  slug: "leetcode/1004-max-consecutive-ones-iii/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/103-binary-tree-zigzag-level-order-traversal/page.mdx": {
	id: "leetcode/103-binary-tree-zigzag-level-order-traversal/page.mdx";
  slug: "leetcode/103-binary-tree-zigzag-level-order-traversal/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/111-minimum-depth-of-binary-tree/page.mdx": {
	id: "leetcode/111-minimum-depth-of-binary-tree/page.mdx";
  slug: "leetcode/111-minimum-depth-of-binary-tree/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/1133-largest-unique-number/page.mdx": {
	id: "leetcode/1133-largest-unique-number/page.mdx";
  slug: "leetcode/1133-largest-unique-number/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/1189-maximum-number-of-balloons/page.mdx": {
	id: "leetcode/1189-maximum-number-of-balloons/page.mdx";
  slug: "leetcode/1189-maximum-number-of-balloons/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/121-best-time-to-buy-and-sell-stock/page.mdx": {
	id: "leetcode/121-best-time-to-buy-and-sell-stock/page.mdx";
  slug: "leetcode/121-best-time-to-buy-and-sell-stock/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/125-valid-palindrome/page.mdx": {
	id: "leetcode/125-valid-palindrome/page.mdx";
  slug: "leetcode/125-valid-palindrome/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/1295-find-numbers-with-even-number-of-digits/page.mdx": {
	id: "leetcode/1295-find-numbers-with-even-number-of-digits/page.mdx";
  slug: "leetcode/1295-find-numbers-with-even-number-of-digits/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/141-linked-list-cycle/page.mdx": {
	id: "leetcode/141-linked-list-cycle/page.mdx";
  slug: "leetcode/141-linked-list-cycle/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/1413-minimum-value-to-get-positive-step-by-step-sum/page.mdx": {
	id: "leetcode/1413-minimum-value-to-get-positive-step-by-step-sum/page.mdx";
  slug: "leetcode/1413-minimum-value-to-get-positive-step-by-step-sum/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/1426-counting-elements/page.mdx": {
	id: "leetcode/1426-counting-elements/page.mdx";
  slug: "leetcode/1426-counting-elements/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/1480-running-sum-of-1d-array/page.mdx": {
	id: "leetcode/1480-running-sum-of-1d-array/page.mdx";
  slug: "leetcode/1480-running-sum-of-1d-array/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/1832-check-if-the-sentence-is-pangram/page.mdx": {
	id: "leetcode/1832-check-if-the-sentence-is-pangram/page.mdx";
  slug: "leetcode/1832-check-if-the-sentence-is-pangram/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/20-valid-parentheses/page.mdx": {
	id: "leetcode/20-valid-parentheses/page.mdx";
  slug: "leetcode/20-valid-parentheses/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/203-remove-linked-list-element/page.mdx": {
	id: "leetcode/203-remove-linked-list-element/page.mdx";
  slug: "leetcode/203-remove-linked-list-element/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/206-reverse-link-list/page.mdx": {
	id: "leetcode/206-reverse-link-list/page.mdx";
  slug: "leetcode/206-reverse-link-list/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/2090-k-radius-subarray-averages/page.mdx": {
	id: "leetcode/2090-k-radius-subarray-averages/page.mdx";
  slug: "leetcode/2090-k-radius-subarray-averages/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/2225-find-players-with-zero-or-one-losses/page.mdx": {
	id: "leetcode/2225-find-players-with-zero-or-one-losses/page.mdx";
  slug: "leetcode/2225-find-players-with-zero-or-one-losses/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/242-valid-anagram/page.mdx": {
	id: "leetcode/242-valid-anagram/page.mdx";
  slug: "leetcode/242-valid-anagram/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/268-missing-number/page.mdx": {
	id: "leetcode/268-missing-number/page.mdx";
  slug: "leetcode/268-missing-number/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/27-remove-element/page.mdx": {
	id: "leetcode/27-remove-element/page.mdx";
  slug: "leetcode/27-remove-element/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/3-longest-substring-without-repeating-characters/page.mdx": {
	id: "leetcode/3-longest-substring-without-repeating-characters/page.mdx";
  slug: "leetcode/3-longest-substring-without-repeating-characters/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/344-reverse-string/page.mdx": {
	id: "leetcode/344-reverse-string/page.mdx";
  slug: "leetcode/344-reverse-string/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/383-ransom-note/page.mdx": {
	id: "leetcode/383-ransom-note/page.mdx";
  slug: "leetcode/383-ransom-note/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/485-max-consecutive-ones/page.mdx": {
	id: "leetcode/485-max-consecutive-ones/page.mdx";
  slug: "leetcode/485-max-consecutive-ones/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/525-contiguous-array/page.mdx": {
	id: "leetcode/525-contiguous-array/page.mdx";
  slug: "leetcode/525-contiguous-array/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/643-maximum-average-subarray-i/page.mdx": {
	id: "leetcode/643-maximum-average-subarray-i/page.mdx";
  slug: "leetcode/643-maximum-average-subarray-i/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/70-climbing-stairs/page.mdx": {
	id: "leetcode/70-climbing-stairs/page.mdx";
  slug: "leetcode/70-climbing-stairs/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/701-insert-into-a-binary-tree/page.mdx": {
	id: "leetcode/701-insert-into-a-binary-tree/page.mdx";
  slug: "leetcode/701-insert-into-a-binary-tree/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/771-jewels-and-stones/page.mdx": {
	id: "leetcode/771-jewels-and-stones/page.mdx";
  slug: "leetcode/771-jewels-and-stones/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/83-remove-duplicates-from-sorted-list/page.mdx": {
	id: "leetcode/83-remove-duplicates-from-sorted-list/page.mdx";
  slug: "leetcode/83-remove-duplicates-from-sorted-list/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/876-middle-of-the-linked-list/page.mdx": {
	id: "leetcode/876-middle-of-the-linked-list/page.mdx";
  slug: "leetcode/876-middle-of-the-linked-list/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/88-merge-sorted-array/page.mdx": {
	id: "leetcode/88-merge-sorted-array/page.mdx";
  slug: "leetcode/88-merge-sorted-array/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"leetcode/977-squares-of-sorted-array/page.mdx": {
	id: "leetcode/977-squares-of-sorted-array/page.mdx";
  slug: "leetcode/977-squares-of-sorted-array/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"next-best-time/page.mdx": {
	id: "next-best-time/page.mdx";
  slug: "next-best-time/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"parse-int/page.mdx": {
	id: "parse-int/page.mdx";
  slug: "parse-int/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"role-tab/page.mdx": {
	id: "role-tab/page.mdx";
  slug: "role-tab/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"stack/page.mdx": {
	id: "stack/page.mdx";
  slug: "stack/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
"updating-bootcamp/page.mdx": {
	id: "updating-bootcamp/page.mdx";
  slug: "updating-bootcamp/page";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".mdx"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
