<template>
  <Card :class="cn('gap-3 py-4', props.class)">
    <CardHeader class="px-4">
      <CardTitle
        class="flex items-center gap-2 font-display text-base text-pp-primary-container"
      >
        <span
          :class="`fi fi-${flagCode} fis`"
          style="font-size: 1.25rem; border-radius: 4px; flex-shrink: 0"
        />
        {{ name }}
      </CardTitle>
    </CardHeader>
    <CardContent class="px-4">
      <Badge :variant="badgeVariant">{{ localizedRequirement }}</Badge>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const props = defineProps<{
  name: string;
  flagCode: string;
  primaryRequirement: string;
  class?: HTMLAttributes["class"];
}>();

const { t, te } = useI18n();

const requirementVariantMap: Record<string, BadgeVariants["variant"]> = {
  VISA_FREE: "success",
  VISA_ON_ARRIVAL: "soft",
  ETA: "soft",
  EVISA: "soft",
  CONDITIONAL_WAIVER: "outline",
  SPECIAL_TERRITORY: "outline",
  ADMISSION_REFUSED: "muted",
  VISA_REQUIRED: "muted",
  UNKNOWN: "muted",
};

const badgeVariant = computed(
  () => requirementVariantMap[props.primaryRequirement] ?? "muted",
);

const localizedRequirement = computed(() => {
  const key = `visaRequirement.${props.primaryRequirement}`;
  return te(key) ? t(key) : props.primaryRequirement;
});
</script>
