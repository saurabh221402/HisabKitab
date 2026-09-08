type RelatedParty = Readonly<{
  id: bigint | number | string;
  name: string;
}>;

export type PartyReferenceOption = Readonly<{
  id: string;
  name: string;
}>;

export function toPartyReferenceOption(
  relatedParty: RelatedParty | readonly RelatedParty[] | null | undefined,
): PartyReferenceOption | null {
  const party = Array.isArray(relatedParty) ? relatedParty[0] : relatedParty;

  return party ? { id: String(party.id), name: party.name } : null;
}
