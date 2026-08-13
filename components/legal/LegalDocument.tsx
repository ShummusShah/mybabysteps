import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'callout'; lines: string[] }
  | { type: 'table'; rows: [string, string][] };

export interface LegalSection {
  heading: string;
  blocks: LegalBlock[];
}

interface LegalDocumentProps {
  title: string;
  effectiveDate: string;
  intro: string;
  sections: LegalSection[];
  contactEmail: string;
  backTo: string;
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'p':
      return <Text style={styles.p}>{block.text}</Text>;
    case 'ul':
      return (
        <View style={styles.list}>
          {block.items.map((item, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.bullet}>{'•'}</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case 'callout':
      return (
        <View style={styles.callout}>
          {block.lines.map((line, i) => (
            <Text key={i} style={[styles.calloutText, i > 0 && styles.calloutTextSpaced]}>
              {line}
            </Text>
          ))}
        </View>
      );
    case 'table':
      return (
        <View style={styles.table}>
          {block.rows.map(([label, value], i) => (
            <View key={label} style={[styles.tableRow, i === block.rows.length - 1 && styles.tableRowLast]}>
              <Text style={styles.tableLabel}>{label}</Text>
              <Text style={styles.tableValue}>{value}</Text>
            </View>
          ))}
        </View>
      );
  }
}

export function LegalDocument({
  title,
  effectiveDate,
  intro,
  sections,
  contactEmail,
  backTo,
}: LegalDocumentProps) {
  const router = useRouter();

  return (
    <ScreenContainer scrollable>
      <Header title={title} leftLabel="‹" leftAction={() => safeBack(router, backTo)} />

      <View style={styles.content}>
        <Text style={styles.effectiveDate}>Effective {effectiveDate}</Text>
        <Text style={styles.intro}>{intro}</Text>

        {sections.map((section, index) => (
          <View key={section.heading} style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={styles.sectionNumberBadge}>
                <Text style={styles.sectionNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.sectionHeading}>{section.heading}</Text>
            </View>
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </View>
        ))}

        <View style={styles.contactBlock}>
          <Text style={styles.contactLabel}>Get in touch</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${contactEmail}`)}>
            <Text style={styles.contactEmail}>{contactEmail}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  effectiveDate: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  intro: {
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: theme.colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumberText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.teal,
  },
  sectionHeading: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    flex: 1,
  },
  p: {
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  list: {
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  bullet: {
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.teal,
    lineHeight: 22,
  },
  listText: {
    flex: 1,
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.text,
    lineHeight: 22,
  },
  callout: {
    backgroundColor: theme.colors.mint,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.teal,
    borderRadius: theme.borderRadius.input,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  calloutText: {
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.text,
    lineHeight: 22,
  },
  calloutTextSpaced: {
    marginTop: theme.spacing.sm,
  },
  table: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  tableRow: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableLabel: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  tableValue: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },
  contactBlock: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  contactLabel: {
    fontSize: theme.typography.label.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  contactEmail: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.teal,
  },
});
