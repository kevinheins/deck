import { module, IController, IScope } from 'angular';
import { AppengineSourceType } from '../serverGroupCommandBuilder.service';
import {
  AccountService,
  ExpectedArtifactSelectorViewController,
  NgAppengineConfigArtifactDelegate,
  IArtifactAccount,
  IArtifactAccountPair,
} from '@spinnaker/core';

import './serverGroupWizard.less';

export interface IAppengineConfigFileConfigurerCtrlCommand {
  configFiles: string[];
  configArtifacts: ConfigArtifact[];
  sourceType: string;
}

class AppengineConfigFileConfigurerCtrl implements IController {
  private artifactAccounts: IArtifactAccount[] = [];
  public command: IAppengineConfigFileConfigurerCtrlCommand;

  constructor(public $scope: IScope) {}

  public $onInit(): void {
    if (!this.command.configFiles) {
      this.command.configFiles = [];
    }
    if (!this.command.configArtifacts) {
      this.command.configArtifacts = [];
    }
    if (!this.$scope.command) {
      this.$scope.command = this.command;
    }
    this.command.configArtifacts = this.command.configArtifacts.map(artifactAccountPair => {
      return new ConfigArtifact(this.$scope, artifactAccountPair);
    });
    AccountService.getArtifactAccounts().then((accounts: IArtifactAccount[]) => {
      this.artifactAccounts = accounts;
      this.command.configArtifacts.forEach((a: ConfigArtifact) => {
        a.delegate.setAccounts(accounts);
        a.controller.updateAccounts(a.delegate.getSelectedExpectedArtifact());
      });
    });
  }

  public addConfigFile(): void {
    this.command.configFiles.push('');
  }

  public addConfigArtifact(): void {
    const artifact = new ConfigArtifact(this.$scope, { id: '', account: '' });
    artifact.delegate.setAccounts(this.artifactAccounts);
    artifact.controller.updateAccounts(artifact.delegate.getSelectedExpectedArtifact());
    this.command.configArtifacts.push(artifact);
  }

  public deleteConfigFile(index: number): void {
    this.command.configFiles.splice(index, 1);
  }

  public deleteConfigArtifact(index: number): void {
    this.command.configArtifacts.splice(index, 1);
  }

  public mapTabToSpaces(event: any) {
    if (event.which === 9) {
      event.preventDefault();
      const cursorPosition = event.target.selectionStart;
      const inputValue = event.target.value;
      event.target.value = `${inputValue.substring(0, cursorPosition)}  ${inputValue.substring(cursorPosition)}`;
      event.target.selectionStart += 2;
    }
  }

  public isContainerImageSource(): boolean {
    return this.command.sourceType === AppengineSourceType.CONTAINER_IMAGE;
  }
}

class ConfigArtifact implements IArtifactAccountPair {
  public $scope: IScope;
  public controller: ExpectedArtifactSelectorViewController;
  public delegate: NgAppengineConfigArtifactDelegate;
  public id: string;
  public account: string;

  constructor($scope: IScope, artifact = { id: '', account: '' }) {
    const unserializable = { configurable: false, enumerable: false, writable: false };
    this.id = artifact.id;
    this.account = artifact.account;
    Object.defineProperty(this, '$scope', { ...unserializable, value: $scope });
    const delegate = new NgAppengineConfigArtifactDelegate(this);
    const controller = new ExpectedArtifactSelectorViewController(delegate);
    Object.defineProperty(this, 'delegate', { ...unserializable, value: delegate });
    Object.defineProperty(this, 'controller', { ...unserializable, value: controller });
  }
}

class AppengineConfigFileConfigurerComponent implements ng.IComponentOptions {
  public bindings: any = { command: '=' };
  public controller: any = AppengineConfigFileConfigurerCtrl;
  public templateUrl = require('./configFiles.component.html');
}

export const APPENGINE_CONFIG_FILE_CONFIGURER = 'spinnaker.appengine.configFileConfigurer.component';
module(APPENGINE_CONFIG_FILE_CONFIGURER, []).component(
  'appengineConfigFileConfigurer',
  new AppengineConfigFileConfigurerComponent(),
);
