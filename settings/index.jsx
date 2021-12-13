registerSettingsPage(({ settings }) => (
  <Page>
    <Section
      title={
        <Text bold>
          Sesame
        </Text>
      }
    >
      <TextInput label="uuid" settingsKey="uuid"></TextInput>
      <TextInput label="Api key" settingsKey="apiKey"></TextInput>
      <TextInput label="Owner QR" settingsKey="qr"></TextInput>
    </Section>
  </Page>
));
