<script setup lang="ts">
import { ref } from "vue";
import { Globe, PlaneLanding, ListFilter, ArrowRight } from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const passportCountry = ref("");
const destination = ref("");

const visaToggles = ref([
  { code: "us", label: "US", enabled: false },
  { code: "gb", label: "UK", enabled: false },
  { code: "eu", label: "EU", enabled: false },
  { code: "ae", label: "UAE", enabled: false },
  { code: "ca", label: "Canada", enabled: false },
  { code: "au", label: "Australia", enabled: false },
]);
</script>

<template>
  <Card
    class="rounded-[2rem] border-0 shadow-[0_32px_64px_rgba(16,42,67,0.08)]"
  >
    <CardContent class="p-6 md:p-8 space-y-6">
      <!-- Inputs -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label
            class="text-[10px] font-bold uppercase tracking-widest text-pp-on-surface-variant px-1"
          >
            Passport Country
          </label>
          <div
            class="flex items-center gap-3 bg-pp-surface-low rounded-xl px-4 py-3"
          >
            <Globe
              class="w-5 h-5 shrink-0 text-pp-secondary"
              :stroke-width="2"
            />
            <Input
              v-model="passportCountry"
              placeholder="e.g. Bangladesh"
              class="border-0 bg-transparent p-0 h-auto shadow-none focus-visible:ring-0 font-display font-bold text-pp-primary-container placeholder:text-pp-on-surface-variant/40"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label
            class="text-[10px] font-bold uppercase tracking-widest text-pp-on-surface-variant px-1"
          >
            Destination
          </label>
          <div
            class="flex items-center gap-3 bg-pp-surface-low rounded-xl px-4 py-3"
          >
            <PlaneLanding
              class="w-5 h-5 shrink-0 text-pp-secondary"
              :stroke-width="2"
            />
            <Input
              v-model="destination"
              placeholder="Where are you heading?"
              class="border-0 bg-transparent p-0 h-auto shadow-none focus-visible:ring-0 font-display font-bold text-pp-primary-container placeholder:text-pp-on-surface-variant/40"
            />
          </div>
        </div>
      </div>

      <!-- Visa Toggles -->
      <div class="space-y-3">
        <div
          class="flex items-center gap-2 pb-2 border-b border-pp-outline-variant/20"
        >
          <ListFilter
            class="w-4 h-4 text-pp-on-surface-variant"
            :stroke-width="2"
          />
          <span
            class="text-[10px] font-bold uppercase tracking-widest text-pp-on-surface-variant"
          >
            Existing Visas &amp; Residency
          </span>
        </div>
        <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
          <label
            v-for="visa in visaToggles"
            :key="visa.code"
            class="flex items-center justify-between p-3 rounded-lg bg-pp-surface-low cursor-pointer transition-colors hover:bg-pp-surface-container"
          >
            <span
              :class="`fi fi-${visa.code} fis`"
              style="font-size: 1.25rem; border-radius: 4px"
            />
            <Switch v-model:checked="visa.enabled" class="scale-75" />
          </label>
        </div>
      </div>

      <!-- CTA Button -->
      <Button
        class="w-full h-14 rounded-xl text-base font-bold text-white border-0 shadow-none hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        style="background: #102a43"
      >
        Get Requirements
        <ArrowRight class="w-4 h-4" :stroke-width="2.5" />
      </Button>
    </CardContent>
  </Card>
</template>
