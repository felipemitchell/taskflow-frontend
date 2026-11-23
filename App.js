import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createTask, deleteTask, getTasks, updateTask } from './src/api';

const colors = { navy: '#14243A', blue: '#3563E9', pale: '#EEF3FF', gray: '#6F7B8E', border: '#DFE5EF', white: '#FFFFFF', red: '#D44C54' };
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setError(''); setTasks(await getTasks()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const openNew = () => { setEditing(null); setTitle(''); setDescription(''); setModal(true); };
  const openEdit = (task) => { setEditing(task); setTitle(task.title); setDescription(task.description || ''); setModal(true); };
  const save = async () => {
    if (!title.trim()) return Alert.alert('Campo obrigatório', 'Digite o título da tarefa.');
    setBusy(true);
    try {
      const data = { title: title.trim(), description: description.trim(), completed: editing?.completed ?? false };
      if (editing) await updateTask(editing._id, data); else await createTask(data);
      setModal(false); await load();
    } catch (e) { Alert.alert('Erro ao salvar', e.message); }
    finally { setBusy(false); }
  };
  const toggle = async (task) => {
    try { await updateTask(task._id, { title: task.title, description: task.description || '', completed: !task.completed }); await load(); }
    catch (e) { Alert.alert('Erro ao atualizar', e.message); }
  };
  const remove = (task) => Alert.alert('Excluir tarefa?', `Deseja excluir “${task.title}”?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: async () => {
      try { await deleteTask(task._id); await load(); } catch (e) { Alert.alert('Erro ao excluir', e.message); }
    } }
  ]);
  const completed = tasks.filter(t => t.completed).length;
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ORGANIZE SEU DIA</Text>
        <Text style={styles.heading}>TaskFlow ✦</Text>
        <Text style={styles.subtitle}>Suas tarefas, no seu ritmo.</Text>
        <View style={styles.summary}><Text style={styles.summaryBig}>{completed} / {tasks.length}</Text><Text style={styles.summaryText}>tarefas concluídas</Text></View>
        <View style={styles.headerRow}><Text style={styles.sectionTitle}>Minhas tarefas</Text><Pressable onPress={openNew} style={styles.add}><Text style={styles.addText}>+ Nova tarefa</Text></Pressable></View>
      </View>
      {loading ? <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 30 }} /> : null}
      {!!error && <View style={styles.error}><Text style={styles.errorText}>{error}</Text><Pressable onPress={load}><Text style={styles.retry}>Tentar novamente</Text></Pressable></View>}
      <FlatList data={tasks} keyExtractor={item => item._id} contentContainerStyle={styles.list} onRefresh={load} refreshing={loading}
        ListEmptyComponent={!loading && !error ? <Text style={styles.empty}>Nenhuma tarefa cadastrada. Comece criando a primeira!</Text> : null}
        renderItem={({ item }) => <View style={styles.task}>
          <Pressable onPress={() => toggle(item)} style={[styles.check, item.completed && styles.checked]}><Text style={styles.checkText}>{item.completed ? '✓' : ''}</Text></Pressable>
          <View style={styles.taskBody}><Text style={[styles.taskTitle, item.completed && styles.done]}>{item.title}</Text>{!!item.description && <Text style={styles.desc}>{item.description}</Text>}</View>
          <Pressable accessibilityLabel="Editar tarefa" onPress={() => openEdit(item)} style={styles.action}><Text style={styles.actionText}>Editar</Text></Pressable>
          <Pressable accessibilityLabel="Excluir tarefa" onPress={() => remove(item)} style={styles.action}><Text style={styles.deleteText}>✕</Text></Pressable>
        </View>}
      />
      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => !busy && setModal(false)}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}><Text style={styles.sectionTitle}>{editing ? 'Editar tarefa' : 'Nova tarefa'}</Text>
            <Text style={styles.fieldLabel}>Título</Text><TextInput style={styles.input} value={title} onChangeText={setTitle} maxLength={120} placeholder="Ex.: Estudar React Native" />
            <Text style={styles.fieldLabel}>Descrição</Text><TextInput style={[styles.input, styles.textarea]} multiline value={description} onChangeText={setDescription} maxLength={1000} placeholder="Detalhes da tarefa (opcional)" />
            <View style={styles.buttons}><Pressable disabled={busy} onPress={() => setModal(false)} style={styles.cancel}><Text>Cancelar</Text></Pressable><Pressable disabled={busy} onPress={save} style={styles.save}><Text style={styles.saveText}>{busy ? 'Salvando...' : 'Salvar tarefa'}</Text></Pressable></View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F9FC' }, header: { paddingHorizontal: 22, paddingTop: 28 }, eyebrow: { fontSize: 11, letterSpacing: 2, fontWeight: '700', color: colors.blue }, heading: { fontSize: 32, fontWeight: '800', color: colors.navy, marginTop: 8 }, subtitle: { color: colors.gray, marginTop: 4, fontSize: 15 }, summary: { marginTop: 24, borderRadius: 20, backgroundColor: colors.navy, padding: 22 }, summaryBig: { color: colors.white, fontSize: 32, fontWeight: '800' }, summaryText: { color: '#C5D4F0', marginTop: 4 }, headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 }, sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.navy }, add: { backgroundColor: colors.blue, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 15 }, addText: { color: colors.white, fontWeight: '700' }, list: { paddingHorizontal: 22, paddingBottom: 32, flexGrow: 1 }, task: { backgroundColor: colors.white, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: colors.border }, check: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.blue, alignItems: 'center', justifyContent: 'center', marginRight: 12 }, checked: { backgroundColor: colors.blue }, checkText: { color: 'white', fontWeight: '800' }, taskBody: { flex: 1 }, taskTitle: { fontWeight: '700', color: colors.navy, fontSize: 15 }, done: { textDecorationLine: 'line-through', color: colors.gray }, desc: { color: colors.gray, fontSize: 12, marginTop: 4 }, action: { padding: 7 }, actionText: { color: colors.blue, fontSize: 12, fontWeight: '700' }, deleteText: { color: colors.red, fontSize: 16 }, empty: { textAlign: 'center', color: colors.gray, marginTop: 45, lineHeight: 22 }, error: { padding: 18, marginHorizontal: 22, backgroundColor: '#FCECEF', borderRadius: 12 }, errorText: { color: colors.red }, retry: { marginTop: 8, fontWeight: '700', color: colors.blue }, overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0007' }, sheet: { backgroundColor: colors.white, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 }, fieldLabel: { marginTop: 20, marginBottom: 8, fontWeight: '700', color: colors.navy }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 13, color: colors.navy, fontSize: 15 }, textarea: { height: 95, textAlignVertical: 'top' }, buttons: { flexDirection: 'row', gap: 12, marginTop: 24 }, cancel: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: '#F1F3F7', borderRadius: 12 }, save: { flex: 2, alignItems: 'center', padding: 16, backgroundColor: colors.blue, borderRadius: 12 }, saveText: { color: 'white', fontWeight: '800' }
});
