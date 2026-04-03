<template>
  <Combobox
    :model-value="modelValue"
    @update:model-value="
      (v) => typeof v === 'string' && emit('update:modelValue', v)
    "
  >
    <ComboboxAnchor class="w-full">
      <ComboboxTrigger
        class="flex w-full items-center justify-between gap-3 bg-pp-surface-low rounded-xl px-4 py-3 h-auto border-0 shadow-none hover:bg-pp-surface-container transition-colors cursor-pointer"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span
            v-if="selectedCountry"
            :class="`fi fi-${selectedCountry.flagCode} fis`"
            style="font-size: 1.25rem; border-radius: 4px; flex-shrink: 0"
          />
          <span
            class="font-display text-sm truncate"
            :class="
              selectedCountry
                ? 'font-bold text-pp-primary-container'
                : 'font-normal text-pp-on-surface-variant/40'
            "
          >
            {{ selectedCountry ? selectedCountry.name : placeholder }}
          </span>
        </div>
        <ChevronsUpDown
          class="w-4 h-4 shrink-0 text-pp-on-surface-variant/50"
          :stroke-width="2"
        />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxList class="w-[var(--reka-combobox-trigger-width)]">
      <ComboboxInput :placeholder="searchPlaceholder" />
      <ComboboxEmpty>No country found.</ComboboxEmpty>
      <ComboboxViewport class="p-1">
        <ComboboxItem
          v-for="country in countries"
          :key="country.code"
          :value="country.code"
          :text-value="`${country.name} ${country.code}`"
          class="flex items-center gap-2 cursor-pointer"
        >
          <span
            :class="`fi fi-${country.flagCode} fis`"
            style="font-size: 1.1rem; border-radius: 3px; flex-shrink: 0"
          />
          <span class="text-sm">{{ country.name }}</span>
          <span class="ml-auto pl-2 text-xs text-pp-on-surface-variant/50">{{
            country.code
          }}</span>
          <ComboboxItemIndicator>
            <Check class="w-3 h-3 text-pp-secondary" :stroke-width="2.5" />
          </ComboboxItemIndicator>
        </ComboboxItem>
      </ComboboxViewport>
    </ComboboxList>
  </Combobox>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ChevronsUpDown, Check } from "lucide-vue-next";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxList,
  ComboboxViewport,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import type { Country } from "@/types/country";

const props = defineProps<{
  modelValue: string;
  countries: Country[];
  placeholder: string;
  searchPlaceholder: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const selectedCountry = computed(() =>
  props.countries.find((c) => c.code === props.modelValue),
);
</script>
