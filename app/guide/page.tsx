export default function GuidePage() {
  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h1 className="text-2xl font-semibold">使用方式介绍</h1>
        <p className="text-slate-600">
          这套学习流程以“先理解、再巩固、再输出”为核心，帮助你把日语短句变成可以脱口而出的表达。
        </p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">1. 继续练习：先按自己的节奏学习</h2>
        <p className="text-slate-600">
          在「继续练习」里，你会看到随机推荐的句子。先听日语，再看中文，配合对话理解情境。
          不用追求速度，先建立对内容的直觉。
        </p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">2. 今日复习：巩固已学内容</h2>
        <p className="text-slate-600">
          复习会优先安排你熟练度较低的句子，让记忆更牢固。这样能把“认识”变成“会用”。
        </p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">3. 跟读（Shadowing）：提升听力与发音</h2>
        <p className="text-slate-600">
          Shadowing 就像跟着影子说话：听到一句日语的瞬间立刻跟读，不停顿、不翻译。
          这种训练能让耳朵习惯母语者语速，同时让嘴巴记住节奏和语调。
        </p>
        <p className="text-slate-600">
          你会发现，日常对话里最重要的不是背单词，而是能自然地说出整句话。Shadowing
          正是最有效的方式之一，它能同时强化听力、发音和反应速度。
        </p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">4. 听力测试：验证学习成果</h2>
        <p className="text-slate-600">
          最后进入听力测试，检验是否真正理解句意和对话逻辑。通过正确率了解掌握程度，
          继续调整练习节奏。
        </p>
      </div>
    </div>
  );
}
