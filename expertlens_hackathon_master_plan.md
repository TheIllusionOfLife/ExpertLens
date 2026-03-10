# ExpertLens — Gemini Live Agent Challenge 優勝狙いの完全企画設計書

## 0. 最初に

本設計書は、**Gemini Live Agent Challenge** において、**Live Agents カテゴリー**での上位入賞、できれば優勝を本気で狙うための、実装可能なレベルまで研ぎ澄ました完全企画書である。  
単なるアイデア集ではなく、**このドキュメントに書かれたことを順に実行すれば、応募用プロダクト、デモ、クラウド構成、公開リポジトリ、説明動画、Devpost提出内容まで一貫して作れる**ことを目的としている。

ただし、誠実に明記しておくべき点がある。  
**優勝は最終的に他チームの出来、審査員の嗜好、提出時点の完成度にも左右されるため保証はできない。**  
本書はあくまで、**現時点で勝率を最大化するための最良設計**である。

---

# 1. ハッカソン要件との整合

## 1-1. エントリーカテゴリー

**Live Agents 🗣️** を選択する。

理由は明確である。

- ExpertLens の本質は **リアルタイム音声対話 + 画面理解 + コンテキスト継続 + 割り込み可能な会話** にある
- UI Navigator のような「実際のGUI操作」まで要求すると、Blender / Photoshop / Unreal のようなネイティブGUIアプリでは安定性が急落する
- 一方、Live Agents は **「See, Hear, Speak」** をどれだけ自然につなげるかが勝負であり、ExpertLens の価値と一致する

### 公式要件との対応

- **Leverage a Gemini model** → Gemini Live API を中核に使う
- **Agents must be built using Google GenAI SDK or ADK** → ADK を採用する
- **Use at least one Google Cloud service** → Cloud Run / Firestore / Cloud Storage / Secret Manager を使う
- **Prove automated Cloud Deployment using scripts or IaC** → Terraform + Cloud Build + deploy script を公開リポジトリに含める

---

# 2. プロダクト定義

## 2-1. 一言で言うと

**ExpertLens は、どんなソフトウェアでも、画面を見ながらリアルタイムで専門家のように助言してくれるライブAIエージェントである。**

## 2-2. 価値提案

ユーザー価値は次の一文に集約される。

> **「今使っているそのソフトに詳しい専門家が、隣に座って、画面を見ながらリアルタイムで助言してくれる」**

## 2-3. 何が新しいのか

既存のチュートリアル、検索、普通のチャットAIでは、次のギャップがある。

1. ユーザーは**検索語がわからない**
2. 教材は**一般論**で、今の画面に対して答えてくれない
3. AIに画像を1枚投げるだけでは、**作業中の継続コンテキスト**を持てない
4. 音声・画面・会話が分断されており、**「ライブ感」がない**

ExpertLens はここを埋める。

- 画面共有で **いま見えている状態** を理解する
- 音声で **自然に質問・割り込み** ができる
- コーチごとの知識とユーザー好みを反映して **専門家らしい回答** を返す
- 会話が継続し、**作業フローの中に溶け込む**

---

# 3. どの問題を解くか

## 3-1. 問題の本質

現代の高度なソフトウェアは強力だが、学習コストが高い。

例:
- Blender
- Photoshop
- Premiere Pro
- DaVinci Resolve
- Unreal Engine
- Figma
- Excel / Sheets の高度機能
- CAD / 3D / compositing 系ツール

これらに共通する問題は、

- 情報は多いが、**今の画面に対して教えてくれる存在がいない**
- チュートリアルは多いが、**どこが詰まりポイントかをユーザー自身が特定しづらい**
- 人間の専門家は高価で、常時は横にいない

## 3-2. ターゲットユーザー

### Primary Target

**中級未満〜中級の知的作業者 / クリエイター / 開発者**

特徴:
- 基本的な操作はできる
- だが詰まりポイントの特定や最短改善が難しい
- その場で質問できる専門家がほしい

### Secondary Target

- オンボーディングを支援したい教育チーム
- 社内ソフトの教育コストが高い企業
- 特定ソフトを使う現場チーム

## 3-3. 優勝狙いでのデモ対象ソフト

汎用対応を主張しつつ、**デモは3種類だけに絞る**。

### 推奨デモ対象

1. **Blender**
   ビジュアル変化が大きく、映える。3Dモデリングの代表格。
2. **Affinity Photo**
   2025年に無料化。誰でも価値がわかる写真編集。ネイティブデスクトップアプリ。
3. **Unreal Engine**
   ゲーム開発・3Dの大型ソフト。学習曲線が非常に高く、ExpertLens の価値が最も伝わりやすい。

> 重要: プロダクトは「どのソフトでもコーチを作れる」が本質だが、**デモは3つまで**。
> そうしないと動画が薄まる。
> デモ対象は全て**ネイティブデスクトップアプリ**である。ブラウザアプリ（Canva, Figma Web等）は対象外。
> ブラウザアプリの操作自動化は UI Navigator カテゴリーの領域であり、ExpertLens のコンセプトとは異なる。
> ExpertLens は「ユーザー自身が操作するデスクトップアプリに対して、専門家として助言する」プロダクトである。

---

# 4. カテゴリー適合ストーリー

## 4-1. なぜ Live Agents なのか

ExpertLens は Live Agents の要件に極めて強く合う。

### 対応関係

- **Real-time Interaction** → 画面を継続的に見ながらリアルタイム応答
- **Audio / Vision** → 画面共有 + 音声対話
- **Can be interrupted** → ユーザーが途中で話して方向修正できる
- **Feels seamless, not turn-based** → 単発画像解析ではなく、継続セッション
- **Distinct persona / voice** → ソフトごとに専門家コーチ人格を生成
- **Context-aware** → 現在の画面・直前の操作・前の会話を踏まえる

## 4-2. 審査員への一言説明

> **ExpertLens is a live multimodal expert that watches your screen, listens to your questions, and coaches you in real time for any software.**

---

# 5. プロダクト体験の核心

## 5-1. 主要ユーザーストーリー

### Story A: コーチ作成

1. ユーザーが ExpertLens のWebアプリを開く
2. 「新しいコーチを作成」を押す
3. ソフト名を入れる（例: Blender）
4. 用途やレベル、好みを入力する
5. ExpertLens が調査し、コーチを生成する
6. コーチライブラリに保存される

### Story B: ライブ支援

1. ユーザーが「Blender Coach」を起動する
2. 画面共有を許可する
3. マイクをONにする
4. AIが「画面を見ています」と案内する
5. ユーザーが作業しながら質問する
6. AIが画面を見ながら短く具体的に助言する
7. ユーザーが途中で割り込んで聞き返せる

### Story C: コーチの好み調整

1. ユーザーが設定画面を開く
2. 「ショートカット優先」「初心者向け」「簡潔」「積極性高め」などを変更
3. 次回以降の回答スタイルに反映される

---

# 6. 競合との差分

## 6-1. Gemini / ChatGPT 単体との違い

### 普通のAI
- 汎用回答
- 単発相談
- 知識はあるが、**ソフト特化が弱い**
- 画面コンテキスト継続が弱い
- ユーザー好みのコーチ人格を持たない

### ExpertLens
- **ソフト専用コーチ** を生成できる
- **画面を見ながら** 答える
- **ライブ会話** と割り込みに強い
- **RAGによりソフト固有の知識で根拠づけ**できる
- **ユーザー好み** を反映できる

## 6-2. 教材との違い

- 教材は一般論、ExpertLens は現場文脈
- 教材は一方向、ExpertLens は双方向
- 教材は検索が必要、ExpertLens はその場質問

---

# 7. 企画の核心アイデア

## 7-1. 「汎用AI」ではなく「生成される専門家」

ExpertLens の本質は、AIアシスタントそのものではなく、

> **ソフトウェアごとの専門家コーチを自動生成し、ライブ実行する仕組み**

にある。

このため、プロダクトは大きく2層に分かれる。

1. **Coach Builder**  
   ソフトごとの知識・人格・指導スタイルを組み立てる
2. **Live Coaching Runtime**  
   実際に画面を見て、音声でライブ支援する

---

# 8. 機能一覧

## 8-1. 必須機能（MVP）

### A. コーチ生成
- ソフト名入力
- ユースケース入力
- 難易度設定
- コーチ生成
- コーチ保存

### B. ライブ支援
- 画面共有
- 音声入出力
- リアルタイム応答
- 割り込み対応
- 会話履歴維持

### C. 根拠づけ
- ソフト固有ドキュメント収集
- 埋め込み生成
- RAG検索
- 応答時の知識参照

### D. パーソナライズ
- 回答の長さ
- 初心者寄り / 上級者寄り
- マウス操作優先 / ショートカット優先 / 混合
- 積極性（受け身 / バランス / 積極）

### E. 運用・提出要件
- Cloud Run 配備
- IaC (Terraform)
- デプロイスクリプト
- 公開リポジトリ

## 8-2. あると強い機能（Stretch）

- コーチの共有URL
- コーチの公開ライブラリ
- 直前会話の要約メモ
- 回答根拠の参照元表示
- 「今の回答を短く / 詳しく」ボタン

> 優勝狙いでも、**Stretch は最大2つまで**。  
> それ以上入れると完成度が落ちる。

---

# 9. 画面設計

## 9-1. 主要画面

### 1. Home / Dashboard
- 新しいコーチを作成
- 既存コーチ一覧
- 最近使ったコーチ

### 2. Create Coach
- Software Name
- Category
- Primary Tasks
- User Skill Level
- Preferred Style
- Create button

### 3. Coach Detail / Settings
- 名前
- 説明
- 回答スタイル
- ショートカット優先度
- 積極性
- 対象ユーザー層
- ナレッジソース一覧

### 4. Live Session
- 画面共有状態
- マイクON/OFF
- 音声会話ログ
- 今のコーチ名
- 返答の短文化 / 詳細化ボタン
- 参考知識の表示（任意）

## 9-2. UI原則

- **クリック数を極小化**する
- ライブ画面は情報過多にしない
- 「作る」と「使う」を明確に分ける
- 回答はなるべく音声中心、テキストは補助

---

# 10. ユーザー設定モデル

## 10-1. 好みとして保持する項目

### Advice Style
- Beginner friendly
- Concise expert
- Step-by-step tutor

### Interaction Preference
- Mouse actions
- Keyboard shortcuts
- Mixed

### Explanation Depth
- Short
- Normal
- Detailed

### Proactivity
- Silent
- Balanced
- Proactive

### Tone
- Friendly
- Professional
- Calm mentor

## 10-2. 反映ルール

例:
- Keyboard shortcuts が選ばれたら、ボタン名よりショートカット優先で答える
- Beginner friendly なら専門用語の直後に言い換えを入れる
- Proactive なら AI が状況を見て軽く注意喚起する

---

# 11. 技術アーキテクチャ

## 11-1. 全体構成

```text
┌─────────────────────────────────────────────────┐
│  USER'S MACHINE                                  │
│                                                   │
│  ┌──────────────┐    ┌─────────────────────────┐ │
│  │ Blender /    │    │  Browser (ExpertLens UI) │ │
│  │ Affinity     │    │                           │ │
│  │ Photo /      │◄───│  getDisplayMedia() picks  │ │
│  │ Unreal       │    │  the app window           │ │
│  │ (native app) │    │                           │ │
│  └──────────────┘    │  getUserMedia() gets mic  │ │
│                      │                           │ │
│                      │  Audio playback ← speaker │ │
│                      └──────────┬────────────────┘ │
└─────────────────────────────────┼──────────────────┘
                                  │ WebSocket
                                  │ (screen frames + audio up,
                                  │  audio response down)
                                  ▼
┌─────────────────────────────────────────────────────┐
│  CLOUD RUN (FastAPI + ADK)                           │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │  WebSocket Handler                               │ │
│  │  - Receives screen frames + audio from browser   │ │
│  │  - Forwards to Gemini Live API session           │ │
│  │  - Receives audio response from Gemini           │ │
│  │  - Streams audio back to browser                 │ │
│  │  - Handles barge-in (user interrupts mid-answer) │ │
│  └──────────────┬──────────────────────────────────┘ │
│                 │                                     │
│  ┌──────────────▼──────────────────────────────────┐ │
│  │  ADK Agent: Live Software Expert                 │ │
│  │                                                   │ │
│  │  System Instruction (per coach):                  │ │
│  │  ├─ Coach persona (Blender mentor, etc.)         │ │
│  │  ├─ Response policy (see → problem → next step)  │ │
│  │  ├─ User preferences (shortcuts, skill level)    │ │
│  │  └─ Pre-loaded knowledge (curated docs)          │ │
│  │                                                   │ │
│  │  Tools (called by Gemini when needed):            │ │
│  │  ├─ get_coach_knowledge(topic) → Firestore       │ │
│  │  └─ get_user_preferences(user_id) → Firestore    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Gemini Live API Session                          │ │
│  │  - Model: gemini-2.5-flash-live-preview           │ │
│  │  - Bidirectional: audio/image in, audio out       │ │
│  │  - contextWindowCompression (SlidingWindow)       │ │
│  │    → 2分制限を無制限に拡張                         │ │
│  │  - sessionResumption (handle-based reconnect)     │ │
│  │  - Native barge-in (VAD)                          │ │
│  │  - NON_BLOCKING tool calling (WHEN_IDLE schedule) │ │
│  └──────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────┐
│  GCP Services                                          │
│  ├─ Firestore: coach profiles, user prefs, sessions   │
│  ├─ Cloud Storage: curated docs, demo assets          │
│  └─ Secret Manager: API keys                          │
└───────────────────────────────────────────────────────┘
```

## 11-1a. ライブセッションの詳細フロー

```text
1. ユーザーが「セッション開始」をクリック（例: Blender Coach）
   │
   ├─ Browser: getDisplayMedia() → ユーザーが Blender ウィンドウを選択
   ├─ Browser: getUserMedia() → マイクアクセス
   ├─ Browser: WebSocket 接続を backend /ws/session に開く
   │
   ▼
2. BACKEND がコネクションを受信
   │
   ├─ Firestore からコーチプロファイルをロード（persona, focus_areas）
   ├─ Firestore からユーザー好みをロード（shortcuts, skill level）
   ├─ Cloud Storage からキュレート済み知識をロード（Blender docs）
   ├─ System Instruction を組み立てる:
   │     "You are ExpertLens, a Blender expert coach...
   │      [persona rules]
   │      [response policy: see → problem → next step]
   │      [user prefers keyboard shortcuts, intermediate level]
   │      [KNOWLEDGE BASE:]
   │      [... キュレート済み Blender 知識 ...]"
   │
   ├─ Gemini Live API セッションを開く:
   │     - model: gemini-2.5-flash-live-preview
   │     - system_instruction: 上記で組み立てたもの
   │     - tools: [get_coach_knowledge, get_user_preferences]
   │       （NON_BLOCKING モード、scheduling=WHEN_IDLE）
   │     - response_modalities: ["AUDIO"]
   │     - context_window_compression: SlidingWindow()
   │       → 画像入力による2分制限を無制限に拡張
   │     - session_resumption: SessionResumptionConfig()
   │       → WebSocket切断時のセッション継続（handle有効期限2時間）
   │
   ▼
3. ライブストリーミングループ
   │
   │  Browser → Backend → Gemini Live API:
   │    - 約1fps でスクリーンフレーム (image/jpeg, 768x768にリサイズ) を送信
   │      → realtime_input.media_chunks[Blob(data=jpeg_bytes, mime_type='image/jpeg')]
   │    - 連続的にマイク音声チャンク (PCM 16bit 16kHz mono) を送信
   │
   │  Gemini Live API → Backend → Browser:
   │    - 音声応答をストリーミング
   │    - Browser のスピーカーで再生
   │
   ▼
4. ユーザーが質問（音声）
   │
   ├─ 音声がストリーム経由で Gemini に到達
   ├─ Gemini が現在のスクリーンフレーム + 質問を認識
   ├─ Context stuffing 済みの知識を参照（追加レイテンシ 0ms）
   ├─ 知識が十分な場合:
   │     → 即座に音声応答を生成・ストリーム返却
   ├─ より詳細が必要な場合:
   │     → get_coach_knowledge(topic="modifier stack") を呼び出し
   │     → Backend が Firestore にクエリ（~100-200ms）
   │     → 結果を Gemini に返却
   │     → Gemini がより深い情報を含む音声応答を生成
   │
   ▼
5. ユーザーが割り込み（barge-in）
   │
   ├─ Gemini が応答中にユーザーが話し始める
   ├─ Gemini Live API が barge-in をネイティブに検知
   ├─ 現在の応答を停止
   ├─ これまでの会話コンテキストを保持したまま新しい入力を処理
   ├─ 割り込みに対応した新しい応答を生成
   │
   ▼
6. セッション終了
   │
   ├─ ユーザーが「セッション終了」をクリック
   ├─ Backend がセッション要約を Firestore に保存
   ├─ Gemini Live API セッションをクローズ
   ├─ WebSocket をクローズ
```

### 実装上の重要ポイント

- **モデル**: `gemini-2.5-flash-live-preview` を使用。`gemini-2.0-flash-live` は非推奨・廃止予定。
- **スクリーンフレーム**: `image/jpeg` 形式で ~1fps 送信。768x768 にリサイズ推奨（品質/トークンのバランス）。`realtime_input.media_chunks` 経由で送信。動画ストリーム（video/mp4）はリアルタイム双方向入力では非サポート。
- **2分制限の回避**: 画像入力があるセッションは自動的に「Audio+Video」扱いとなり2分制限が発生する。**`contextWindowCompression` (SlidingWindow) を必ず有効化**して無制限に拡張する。これなしではコーチングセッションが2分で切れる。
- **セッション継続**: WebSocket接続は最大約10分で切断される。`sessionResumption` を設定し、サーバーから受け取る `new_handle` を保存して再接続する。handle の有効期限は2時間。サーバーは切断前に `GoAway` メッセージを送信するので、proactive に再接続する。
- **音声フォーマット**: 入力: PCM 16bit 16kHz mono。出力: 24kHz。Browser の AudioWorklet で生成可能。
- **Barge-in**: Gemini Live API が VAD（Voice Activity Detection）でネイティブ処理。自前実装は不要。VAD パラメータ（`startOfSpeechSensitivity`, `endOfSpeechSensitivity`, `silenceDurationMs`）の調整が可能。
- **Tool calls**: `NON_BLOCKING` モードで `scheduling=WHEN_IDLE` を使用。音声応答を中断せずにツール結果を返す。デモでは context stuffing を主とし、ツール呼び出しを最小化する。
- **コンテキストウィンドウ**: Native audio モデルは 128k トークン。System Instruction のキュレート済み知識は ~50-70 ページ分が上限目安。
- **画面共有の対象**: `getDisplayMedia()` でユーザーがネイティブデスクトップアプリのウィンドウを選択する。Blender, Affinity Photo, Unreal Engine 等、あらゆるデスクトップGUIアプリに対応。

### Python SDK 実装リファレンス

```python
from google import genai
from google.genai import types

client = genai.Client()

# セッション設定
config = types.LiveConnectConfig(
    system_instruction="You are ExpertLens, a Blender expert coach...",
    response_modalities=["AUDIO"],
    tools=[types.Tool(function_declarations=[...])],
    tool_config=types.ToolConfig(
        function_calling_config=types.ToolConfig.FunctionCallingConfig(
            mode='NON_BLOCKING'
        )
    ),
    context_window_compression=types.ContextWindowCompressionConfig(
        sliding_window=types.SlidingWindow()
    ),
    session_resumption=types.SessionResumptionConfig(),
)

# セッション開始
async with client.aio.live.connect(
    model="gemini-2.5-flash-live-preview", config=config
) as session:

    # スクリーンフレーム送信（~1fps）
    await session.send(
        input=types.LiveClientMessage(
            realtime_input=types.RealtimeInput(
                media_chunks=[
                    types.Blob(data=jpeg_bytes, mime_type='image/jpeg')
                ]
            )
        )
    )

    # 受信ループ
    async for message in session.receive():
        if message.session_resumption_update:
            saved_handle = message.session_resumption_update.new_handle
        if message.tool_call:
            # NON_BLOCKING ツール応答
            await session.send_tool_response(
                types.LiveClientToolResponse(
                    function_responses=[...],
                    scheduling='WHEN_IDLE'
                )
            )
```

## 11-2. 採用技術

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- WebRTC / MediaDevices API

### Backend
- Python FastAPI
- Google ADK (Python SDK)
- Gemini Live API (model: `gemini-2.5-flash-live-preview`)
- Python SDK: `google-genai` (`pip install google-genai`)

### Cloud
- Cloud Run
- Firestore
- Cloud Storage
- Secret Manager
- Cloud Logging
- Cloud Build
- Terraform

### 知識基盤（Grounding）
- **Context Stuffing（主）**: コーチ生成時にキュレートした知識を、セッション開始時に System Instruction に直接ロードする。追加レイテンシ 0ms。Gemini の大規模コンテキストウィンドウを活用。
- **Firestore Tool（副）**: Context に収まらない深い知識が必要な場合のフォールバック。メタデータ（software_name, topic）による Firestore クエリで ~100-200ms。

> pgvector / Cloud SQL / Vertex AI Embeddings は不要。ハッカソンでは context stuffing + Firestore fallback が最速かつ最も信頼性が高い。

---

# 12. Agent Architecture

## 12-1. なぜ ADK を使うのか

ハッカソン要件に適合するだけでなく、審査で **「Agentとして設計している」** ことを示しやすいからである。

## 12-2. Agent の内部構成

### Primary Agent: Live Software Expert Agent
役割:
- 画面の文脈理解
- 音声対話
- 回答生成

知識の主な供給源は **System Instruction に事前ロードされた context stuffing** である。
セッション開始時に、コーチ固有のキュレート済み知識・ユーザー好み・応答ポリシーを全て System Instruction に組み込む。
これにより、大半の質問に対して追加のツール呼び出しなしで即座に応答できる。

### Tool 1: get_coach_knowledge(topic: str)
役割:
- Context stuffing に含まれない深い知識が必要な場合のフォールバック
- Firestore からメタデータ（software_name + topic）でクエリ
- レイテンシ: ~100-200ms

### Tool 2: get_user_preferences(user_id: str)
役割:
- ユーザーの好み反映（主にセッション開始時に System Instruction にロード済み）
- セッション中にユーザーが好みを変更した場合のフォールバック

## 12-3. Response policy

返答は以下のテンプレートに制約する。

1. **何が見えているか**
2. **何が問題か / 何をすべきか**
3. **次の一手**

例:

> いまメッシュ表面にシェーディングの乱れが見えます。  
> 原因は法線の不整合の可能性が高いです。  
> ショートカット優先なら **Shift+N** で法線再計算を試してください。

---

# 13. Coach Builder 設計

## 13-1. 生成フロー

1. ユーザーがソフト名を入力
2. シード知識を収集
3. ソフト固有の指導観点を抽出
4. コーチプロファイルを生成
5. ナレッジベースを作成
6. コーチ完成

## 13-2. 知識ソース

### 優先順位
1. 公式ドキュメント
2. 公式ヘルプ / FAQ
3. 公式YouTube / チュートリアル
4. 高品質なコミュニティQ&A

## 13-3. 収集対象

- 製品概要
- 主要機能
- よくあるエラー
- ショートカット一覧
- ベストプラクティス
- 初心者がつまずくポイント

## 13-4. コーチプロファイル生成例

```json
{
  "software_name": "Blender",
  "coach_name": "Blender Coach",
  "domain": "3D modeling and rendering",
  "focus_areas": [
    "topology",
    "modifiers",
    "lighting",
    "render optimization"
  ],
  "answer_style": "concise_actionable",
  "preferred_reference_type": "official_docs_first"
}
```

## 13-5. 実装上の現実的方針

ハッカソンでは、**完全自動Webクローラーを最初から完成させる必要はない**。  
最初は以下でよい。

- ユーザーがソフト名を入力
- あらかじめ用意した「高品質な候補ソース」に対して検索・取得
- 数十〜数百チャンクのナレッジベースを自動生成

> 重要: 「任意ソフトに対応可能」という主張に対して、デモでは 3種類以上のコーチ生成を見せる。  
> これで汎用性を証明する。

---

# 14. Grounding 設計

## 14-1. なぜ Grounding が必須か

審査基準に **hallucination avoidance / grounding** がある。
ExpertLens は「専門家らしさ」を売りにするので、根拠づけが弱いと一気に危険になる。

## 14-2. Context Stuffing（主戦略）

セッション開始時に、コーチ固有のキュレート済み知識を System Instruction に直接ロードする。

### キュレート対象（ソフトごとに事前準備）
- 公式ドキュメントの要約（主要機能、ワークフロー）
- ショートカット一覧
- よくあるエラーと解決策
- 初心者がつまずくポイント
- ベストプラクティス

### 知識ドキュメントの構造

各ドキュメントには以下のメタデータを持たせる。
- source_title
- source_type
- software_name
- topic
- content
- shortcut_tags
- difficulty_level

### サイズ目安
- コーチあたり 20〜50 ページ分のキュレート済みテキスト
- Gemini Live API の System Instruction に収まる範囲
- 最重要の知識（ショートカット、頻出エラー、基本ワークフロー）を優先

### 速度上の利点
- 追加レイテンシ: **0ms**（知識は既にコンテキスト内）
- ツール呼び出しによる音声ストリームの中断なし
- ライブ感を損なわない

## 14-3. Firestore Fallback（副戦略）

Context stuffing に含まれない深い知識が必要な場合、`get_coach_knowledge(topic)` ツールで Firestore にクエリする。

- software_name + topic メタデータによるフィルタリング
- レイテンシ: ~100-200ms（ツール呼び出しによる一時停止あり）
- デモでは主に context stuffing で対応し、Firestore fallback の使用を最小化する

## 14-4. 応答方針

- context stuffing の知識に基づくときは断定しやすい
- 画面だけ見えていて知識根拠が弱いときは「可能性が高い」と表現する
- 画面に見えていない情報は勝手に断定しない

---

# 15. ライブ対話設計

## 15-1. このプロダクトの勝ち筋

審査基準の 40% は **Innovation & Multimodal User Experience** である。  
つまり、ただRAGがあるだけでは勝てない。  
重要なのは、**本当に“Live”に感じること**である。

## 15-2. 必須UX要件

- ユーザーは自然に話しかけられる
- AI が途中で割り込まれても会話を継続できる
- AI が「いま見ている画面」を踏まえた返答をする
- 単なるテキストボックス感がない

## 15-3. 応答の理想

- 初回応答: 2〜5秒
- 返答長: 1〜3文
- 追加で深掘りできる

## 15-4. 例

ユーザー:
> これ、なんでうまくいってないですか？

AI:
> いまモディファイア順の影響で表面が崩れて見えています。  
> 先にスケールを適用してからモディファイアを見直すのが安全です。  
> ショートカット優先なら **Ctrl+A** で Scale を適用できます。

ユーザー:
> いや、見た目じゃなくて重さが問題です。

AI:
> 了解です。重さの観点に絞ると、Subdivision のビューポート設定が高いのが主因に見えます。

この**割り込みの自然さ**が、Live Agentsで高評価につながる。

---

# 16. Persona / Voice 設計

## 16-1. なぜ必要か

審査基準に **distinct persona/voice** がある。  
したがって、単なる汎用音声アシスタントではなく、**専門家らしい声の人格**が必要。

## 16-2. 基本ペルソナ

### Base Persona
- calm
- competent
- non-judgmental
- concise

### ソフトごとの人格補正
- Blender: technical artist mentor
- Affinity Photo: creative retouch mentor
- Unreal Engine: game development / 3D technical mentor

## 16-3. 声の方向性

- 落ち着いている
- 短く、実務的
- 上から目線にならない

---

# 17. プロンプト戦略

## 17-1. システムプロンプト骨子

```text
You are ExpertLens, a live software expert coach.
You watch the user's shared screen, listen to their voice, and respond in real time.
Your job is to provide grounded, concise, software-specific guidance.
Never pretend to see things you cannot see.
Prefer action-oriented advice.
Respect the user's coaching preferences.
If the user prefers shortcuts, prioritize shortcuts over mouse actions.
If uncertain, say what you are uncertain about.
Use retrieved knowledge when available.
Keep initial answers brief and interruptible.
```

## 17-2. コーチごとの追加プロンプト

例: Blender Coach

```text
You are an expert Blender coach focused on topology, modifiers, shading, lighting, and render optimization.
Prefer official Blender workflows when possible.
Warn about common beginner-to-intermediate mistakes.
```

## 17-3. 出力制約

- 初回は最大3文
- 必ず「次の一手」を含める
- 不確実性がある場合は明示

---

# 18. 失敗を避ける安全策

## 18-1. Hallucination対策

- RAG検索結果を優先
- 画面に見えない設定を断定しない
- 「可能性が高い」「まず試すべき」を多用
- 公式ソース優先

## 18-2. エラー時のUX

- 画面共有が切れたら再接続案内
- 音声認識が失敗したらテキスト fallback
- retrieval 失敗時は汎用回答 + 不確実性明示

## 18-3. 禁止事項

- 無根拠に「見えた」と言わない
- 見えていない内部状態を断定しない
- 長すぎる講義にしない

---

# 19. Google Cloud 構成

## 19-1. 使うサービス

- **Cloud Run**: API / ADK runtime
- **Firestore**: coach metadata / session metadata / user preferences / fallback knowledge
- **Cloud Storage**: curated docs, demo assets
- **Secret Manager**: API keys / secrets
- **Cloud Build**: CI/CD
- **Artifact Registry**: container images
- **Cloud Logging**: logs

## 19-2. これで審査対応できる項目

- Google Cloud service usage
- robust backend hosted on Google Cloud
- visible deployment architecture
- automated deployment evidence

---

# 20. IaC / デプロイ設計

## 20-1. 必須提出物

- `infra/terraform/` ディレクトリ
- Cloud Run service 定義
- Firestore / Storage / Secret Manager 設定
- `deploy.sh`
- `cloudbuild.yaml`

## 20-2. 推奨リポジトリ構成

```text
expertlens/
├─ app/
│  ├─ web/
│  └─ api/
├─ agent/
│  ├─ runtime/
│  ├─ tools/
│  └─ prompts/
├─ infra/
│  ├─ terraform/
│  ├─ cloudbuild.yaml
│  └─ deploy.sh
├─ data/
│  ├─ seed_sources/
│  └─ coach_profiles/
├─ scripts/
│  ├─ build_coach.py
│  ├─ ingest_docs.py
│  └─ eval_sessions.py
├─ demo/
│  ├─ architecture.png
│  ├─ deployment_recording.mp4
│  └─ video_script.md
└─ README.md
```

## 20-3. 審査で見せるべきこと

- `terraform apply` の画面または構成
- Cloud Run dashboard
- deployed URL
- public repo の IaC ディレクトリ

> **重要**: GCP デプロイ証明はデモ動画とは**別の短い画面録画**が必要（スクリーンショットでは不十分）。
> Cloud Run のコンソール画面、ログ出力、デプロイ済みサービスが動作している様子を録画する。

---

# 21. データモデル

## 21-1. Coach

```json
{
  "coach_id": "uuid",
  "software_name": "Blender",
  "coach_name": "Blender Coach",
  "category": "3D",
  "focus_areas": ["topology", "modifiers"],
  "persona": "calm expert mentor",
  "default_preferences": {
    "interaction": "shortcuts",
    "depth": "normal",
    "proactivity": "balanced"
  },
  "knowledge_index_id": "uuid"
}
```

## 21-2. User Preferences

```json
{
  "user_id": "uuid",
  "global_preferences": {
    "interaction": "shortcuts",
    "tone": "professional",
    "depth": "short"
  },
  "coach_overrides": {
    "coach_blender": {
      "proactivity": "balanced"
    }
  }
}
```

## 21-3. Session

```json
{
  "session_id": "uuid",
  "coach_id": "uuid",
  "user_id": "uuid",
  "started_at": "timestamp",
  "summary": "user was working on shading artifacts",
  "last_topics": ["normals", "modifier order"]
}
```

---

# 22. MVPの厳密な範囲

## 22-1. ここまで作れば応募できる最小完成形

### 必須
- Web GUI
- 3つのコーチ作成実演
- 1つのライブセッションでの自然な音声対話
- 割り込み会話
- RAGによる根拠付き回答
- ユーザー好み設定反映
- Cloud Run デプロイ
- Terraform
- 公開リポジトリ
- 動作デモ動画

### なくてもよい
- 完全自動の無限ソフト対応
- 本格的なマーケットプレイス
- 複数ユーザー共有
- 高度な長期記憶

## 22-2. デモで使うコーチ3種

### 必須3種
- Blender Coach
- Affinity Photo Coach
- Unreal Engine Coach

> ここで**「どんなデスクトップアプリにも対応可能」**を視覚的に示す。
> 3つとも**ネイティブデスクトップアプリ**であることがポイント。

---

# 23. 実装タスク一覧

## 23-1. Product / UX

1. 名前・価値提案を固定する
2. 主要画面4枚をFigmaまたは実装で決める
3. コーチ生成フローを簡潔化する
4. ユーザー設定項目を固定する
5. デモ導線を最短にする

## 23-2. Frontend

1. Dashboard 実装
2. Create Coach 画面実装
3. Settings 画面実装
4. Live Session 画面実装
5. 画面共有実装
6. マイク入出力実装
7. 会話ログ表示

## 23-3. Backend / Agent

1. ADK runtime の雛形
2. Gemini Live 接続
3. session memory 実装
4. coach profile loader 実装
5. RAG tool 実装
6. grounding formatter 実装
7. 割り込みに強いレスポンス制御

## 23-4. Knowledge / RAG

1. ソフトごとの seed source 作成
2. ドキュメント取得スクリプト
3. チャンク分割
4. embedding 生成
5. vector store 格納
6. retrieval 評価

## 23-5. Cloud / Infra

1. Dockerfile
2. Cloud Run deploy
3. Firestore 設定
4. Cloud Storage bucket
5. Secret Manager
6. Terraform
7. cloudbuild.yaml

## 23-6. Demo / Submission

1. architecture diagram
2. cloud deployment 画面録画（スクリーンショットではなく録画）
3. demo script
4. 4分動画撮影
5. README（Spin-up Instructions を最重要項目として含む）
6. Devpost回答文

## 23-7. Bonus Points（勝敗を分ける追加点）

1. ブログ記事の公開（+0.6点） — Medium / dev.to 等で「How I built ExpertLens with Gemini Live API and ADK」を公開。`#GeminiLiveAgentChallenge` ハッシュタグ必須。ハッカソン参加のために作成した旨を明記。
2. GDG メンバーシップ（+0.2点） — Google Developer Group に登録し、公開プロフィールリンクを提出。5分で完了。
3. IaC 自動化（+0.2点） — Terraform + deploy.sh を公開リポジトリに含める（既に計画済み）。

> **合計 +1.0 点**。最大スコア 6.0 中の 1.0 は極めて大きい。
> 特にブログ記事の +0.6 は最も ROI が高い活動である。1〜2時間の執筆で 0.6 点を獲得できる。

---

# 24. 日別アクションプラン

以下は**7日仕上げ**を想定した最短実行プランである。  
期間が長いなら各日を2日に拡張すればよい。

## Day 1 — 企画固定

### やること
1. プロダクト名を ExpertLens で固定
2. Live Agents カテゴリーで行くと決定
3. 価値提案を1文に固定
4. デモ対象ソフト3つを決定
5. 画面遷移をラフで描く
6. repo 作成
7. Cloud project 作成

### 完了条件
- README の冒頭が書ける
- 何を作るかがブレない

## Day 2 — フロント雛形 + クラウド土台

### やること
1. Next.js app 作成
2. Dashboard / Create Coach / Live Session の骨組み
3. Cloud Run 用の Hello World API
4. Terraform 雛形
5. Cloud Build 雛形

### 完了条件
- Webアプリが開く
- Cloud Run に最低限デプロイできる

## Day 3 — Coach Builder 実装

### やること
1. コーチ作成フォーム実装
2. seed source 定義
3. ingestion script 実装
4. embedding + vector DB 連携
5. coach profile JSON 生成
6. Firestore 保存

### 完了条件
- Blender / Affinity Photo / Unreal Engine のコーチが生成される

## Day 4 — Live Agent 実装

### やること
1. 画面共有取得
2. マイク入力
3. Gemini Live API 接続
4. ADKエージェント実装
5. 会話履歴管理
6. RAG tool 呼び出し

### 完了条件
- 画面を見ながら音声で答える最小動作が成立

## Day 5 — パーソナライズ + 品質向上

### やること
1. 設定画面実装
2. ショートカット優先などを反映
3. 応答テンプレート最適化
4. hallucination を抑える
5. 割り込み対話改善

### 完了条件
- 「好みに応じてコーチの振る舞いが変わる」が見せられる

## Day 6 — デモ仕上げ

### やること
1. 3ソフトでのデモ手順固定
2. architecture diagram 作成
3. deployment screenshot 撮影
4. README 完成
5. Devpostドラフト作成
6. 動画脚本作成

### 完了条件
- 録画できる状態

## Day 7 — 録画 / 提出

### やること
1. デモ動画撮影
2. 必要なら撮り直し
3. Devpost に記入
4. public repo を整える
5. IaC と deploy スクリプト確認
6. 最終提出

### 完了条件
- 第三者が repo を見て「要件を満たしている」と判断できる

---

# 25. デモ動画の完全脚本

## 25-1. 動画尺

**4分（最大尺）** をフル活用する。4分を超えると最初の4分のみ評価される。

## 25-2. 構成

### Part 1 — Problem (25秒)

ナレーション:

> Modern software is powerful, but hard to learn.
> Tutorials are generic. Experts are expensive.
> And most AI tools don’t truly see what you are doing right now.

画面:
- Blender で迷っている様子（複雑なUI、どこをクリックすべきかわからない）

### Part 2 — Solution (20秒)

ナレーション:

> ExpertLens is a live multimodal expert that watches your screen, listens to your voice, and coaches you in real time — for any desktop software.

画面:
- ExpertLens のダッシュボード

### Part 3 — Coach Builder (35秒)

画面:
- 「Create Coach」
- Blender と入力
- Coach 生成
- Affinity Photo / Unreal Engine も並べて汎用性を示す

ナレーション:

> We can generate specialized coaches for different software, each grounded with software-specific knowledge and personalized for the user.

### Part 4 — Live Session Demo 1: Blender (70秒) ★動画の核心

画面:
- Blender Coach 起動
- 画面共有（Blender ウィンドウを選択）
- ユーザーが音声で質問
- AIが画面を見て具体的に答える
- **途中で割り込み（barge-in）** → AIが自然に方向転換
- ショートカット優先設定に基づいた返答

> **barge-in の自然さを必ず見せる。** 審査基準 Live Agents に「handles interruptions (barge-in) naturally」と明記されている。

### Part 5 — Live Session Demo 2: Affinity Photo (30秒)

画面:
- Affinity Photo Coach に切り替え
- 別のソフトでも同様に画面を見て助言する様子
- コーチの人格・専門性が変わっていることを示す

ナレーション:

> The same experience works across any desktop application. Each coach has its own expertise and personality.

### Part 6 — Personalization (20秒)

画面:
- Settings 画面
- mouse actions → keyboard shortcuts に変更
- AIの回答スタイルが変化する前後を比較

### Part 7 — Architecture & Cloud (30秒)

画面:
- architecture diagram
- Cloud Run / Firestore / Storage / Secret Manager / ADK / Gemini Live API を示す
- Terraform / IaC の存在を示す

ナレーション:

> Built with Google ADK and Gemini Live API, deployed on Cloud Run with full infrastructure-as-code.

### Part 8 — Closing (10秒)

ナレーション:

> ExpertLens turns any desktop software into a live, expert-guided experience.

---

# 26. 審査基準別の勝ち筋

## 26-1. Innovation & Multimodal UX (40%)

### 勝ち筋
- 画面 + 音声 + ライブ会話が自然
- 単なる text box ではない
- AI が「見ている」感がある
- 割り込みが自然
- コーチごとに人格がある

### 必ず見せること
- 画面共有
- 音声応答
- 割り込み
- 画面文脈に沿った返答

## 26-2. Technical Implementation & Agent Architecture (30%)

### 勝ち筋
- ADK を使っている
- Google Cloud 上で動いている
- RAG により grounding がある
- 不確実性を適切に扱う

### 必ず示すこと
- architecture diagram
- RAG flow
- Cloud deployment
- Terraform / deploy script

## 26-3. Demo & Presentation (30%)

### 勝ち筋
- 問題が一瞬でわかる
- デモが本当に動いている
- クラウド構成が明確
- 3つのコーチで汎用性を示す

### 必ず避けること
- 長い説明だけで終わる
- 画面を見せない
- クラウド証拠がない
- 「雰囲気だけ」で動作が弱い

---

# 27. README 構成

README には最低限以下を入れる。

1. **Spin-up Instructions（最重要）** — セットアップと実行手順。ローカル実行とクラウドデプロイの両方。審査の Stage 1 pass/fail 要件。
2. Project Overview
3. Why this matters
4. Live Agents category fit
5. Features
6. Architecture
7. Google Cloud usage
8. ADK usage
9. Grounding strategy
10. IaC / deployment
11. Demo video link

> **重要**: Spin-up Instructions は README の冒頭近くに配置し、実際に動作することを確認する。
> 審査員が再現可能性を判断するために使う。形骸化した手順は逆効果。

---

# 28. Devpost 提出文の骨子

## Tagline

**Expert advice for any software, live on your screen.**

## Problem

Software is powerful but difficult. Existing tutorials are generic, and normal AI tools don’t truly see what users are doing in real time.

## Solution

ExpertLens creates software-specific live expert coaches that watch your screen, listen to your voice, and provide grounded, personalized guidance in real time.

## Tech

- Gemini Live API
- Google ADK (Python)
- Cloud Run
- Firestore
- Cloud Storage
- Secret Manager
- Terraform

## What makes it special

- Live screen-aware voice coaching
- Interruptible natural conversation
- Software-specific expert personas
- Personalized coaching preferences
- Context-stuffed grounding to reduce hallucinations with zero latency

---

# 29. 最後に削るべきもの

勝つためには、**やりたいことを増やすより、削ること**が重要である。

以下は削る。

- GUI操作の自動化
- 共有マーケットプレイス
- 多人数同時セッション
- 長期学習推薦システム
- 完全自動クローリングの完成度追求

代わりに磨く。

- ライブ感
- 画面文脈理解
- 音声対話
- 割り込み
- grounding
- パーソナライズ
- デモの映え

---

# 30. 最終チェックリスト

## プロダクト
- [ ] Web GUI がある
- [ ] コーチ作成ができる
- [ ] 3種類のコーチがある
- [ ] ライブ音声対話ができる
- [ ] 画面共有に基づく回答ができる
- [ ] ユーザー好みを反映できる

## 技術
- [ ] Gemini Live API を使っている
- [ ] ADK (Python) を使っている
- [ ] Google Cloud を使っている
- [ ] Context stuffing による grounding がある
- [ ] Firestore fallback tool がある
- [ ] hallucination 対策がある
- [ ] ログとエラー処理がある
- [ ] barge-in（割り込み）が自然に動作する

## インフラ
- [ ] Cloud Run に載っている
- [ ] Terraform がある
- [ ] deploy script がある
- [ ] public repo に入っている

## デモ
- [ ] 問題が明確
- [ ] 実際に動いている
- [ ] 3ソフト（Blender, Affinity Photo, Unreal Engine）で汎用性を示している
- [ ] barge-in の自然さを見せている
- [ ] architecture diagram がある
- [ ] cloud deployment proof がある（デモとは別の画面録画）
- [ ] 動画は4分以内

## 提出
- [ ] README 完成（Spin-up Instructions が先頭近くにある）
- [ ] Devpost 記入
- [ ] 動画提出（YouTube or Vimeo、公開設定）
- [ ] リポジトリ公開

## Bonus Points
- [ ] ブログ記事公開（+0.6）— `#GeminiLiveAgentChallenge` 付き
- [ ] GDG メンバーシップ登録（+0.2）
- [ ] IaC 自動化がリポジトリに含まれている（+0.2）

---

# 31. 最終提言

ExpertLens の勝ち筋は、**「何でもできる」ことを言うのではなく、「今の画面を見て、その場で専門家のように助言するライブ体験」を圧倒的に自然に見せること**にある。

このプロジェクトで最も重要なのは次の3点である。

1. **Live感**  
   画面共有・音声・割り込みが自然であること
2. **Grounding**  
   ソフト固有知識に基づいて答えていること
3. **Demonstrability**  
   動画で一瞬で価値が伝わること

これを守れば、ExpertLens は Live Agents カテゴリーで十分戦える。

---

# 32. 次の即時アクション

この企画書を読んだ直後にやるべきことは以下。

1. GDG メンバーシップに登録する（5分、+0.2点）
2. デモ対象ソフト3つを確定する（Blender, Affinity Photo, Unreal Engine）
3. リポジトリを切る
4. Cloud project を作る
5. Dashboard / Create Coach / Live Session のUIを先に作る
6. Blender Coach だけ先に通す
7. その後 Affinity Photo / Unreal Engine を追加する
8. ブログ記事を執筆・公開する（+0.6点）
9. GCP デプロイ証明の画面録画を撮る
10. 最後にデモ動画（4分）を磨く

以上。

